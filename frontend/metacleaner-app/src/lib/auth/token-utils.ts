import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { authStore } from './auth.svelte.js';

// Routes that legitimately receive auth-callback tokens from the backend redirect.
// Tokens found on any OTHER route are silently discarded to prevent login-CSRF / session-fixation.
export const BROWSER_CALLBACK_PATHS = ['/email-verified'];

const OAUTH_STATE_KEY = 'mc_oauth_state';

/**
 * Generates a random state nonce, stores it in sessionStorage, and returns it.
 * Call this before redirecting to an OAuth provider so the callback can be verified.
 */
export function generateOAuthState(): string {
	const state = crypto.randomUUID();
	sessionStorage.setItem(OAUTH_STATE_KEY, state);
	return state;
}

/**
 * Verifies the OAuth state nonce received in the callback against the stored value.
 * The stored nonce is consumed (deleted) on first call — reuse is rejected.
 * Returns true only when the received state matches the stored nonce.
 */
export function verifyOAuthState(receivedState: string | null): boolean {
	const stored = sessionStorage.getItem(OAUTH_STATE_KEY);
	sessionStorage.removeItem(OAUTH_STATE_KEY);
	return stored !== null && stored === receivedState;
}

export interface TokenParams {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface CallbackResult {
	tokens?: TokenParams;
	error?: string;
}

/**
 * Parses auth callback parameters from any URL string.
 * Handles both web browser (window.location.href) and Capacitor deep link URLs.
 * Prefers the hash fragment (never sent to the server/proxy) over query params.
 * Query-string tokens are accepted here for deep-link compatibility but rejected
 * by extractAndCleanBrowserTokens() on the browser path to prevent proxy log leakage.
 * Returns tokens if present, error string if an error param is present, or an empty object.
 */
export function extractCallbackParams(url: string): CallbackResult {
	let search: string;
	let hash: string;
	try {
		// Works for both full URLs and bare query strings like "?access_token=..."
		const u =
			url.includes('?') || url.includes('#')
				? new URL(url, 'https://x')
				: new URL(`https://x${url}`);
		search = u.search;
		hash = u.hash;
	} catch {
		return {};
	}

	// Prefer hash fragment — tokens in the fragment are never sent to the server and
	// do not appear in access logs or Referer headers.
	let params = hash
		? new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
		: new URLSearchParams(search);

	const error = params.get('error');
	if (error) return { error };

	const accessToken = params.get('access_token');
	const refreshToken = params.get('refresh_token');
	const expiresInRaw = params.get('expires_in');

	if (!accessToken || !refreshToken) return {};

	const expiresIn = expiresInRaw ? Number(expiresInRaw) : 3600;
	return { tokens: { accessToken, refreshToken, expiresIn } };
}

/**
 * Extracts auth callback params from window.location (browser path only) and removes
 * them from the address bar using history.replaceState so tokens are not visible in
 * browser history. Query-string tokens are rejected — only hash-fragment tokens are
 * accepted, since query params are logged by reverse proxies before cleanup runs.
 * (Req 15.4, 18.7)
 */
export function extractAndCleanBrowserTokens(): CallbackResult {
	if (!browser) return {};

	// Only accept hash-fragment tokens on the browser path.
	// Query-string tokens reach the server in the initial HTTP request and are
	// logged before this cleanup runs — they must be rejected, not silently adopted.
	const hasQueryTokens =
		window.location.search.includes('access_token') ||
		window.location.search.includes('refresh_token');

	const hasHashTokens =
		window.location.hash.includes('access_token') ||
		window.location.hash.includes('refresh_token');

	const hasError =
		window.location.search.includes('error') || window.location.hash.includes('error');

	// Build a hash-only URL for extraction so query-string tokens are never processed
	const hashOnlyUrl = window.location.hash
		? `https://x${window.location.hash}`
		: window.location.href;

	const result = hasHashTokens || hasError ? extractCallbackParams(hashOnlyUrl) : {};

	if (hasQueryTokens || hasHashTokens || hasError) {
		const clean = new URL(window.location.href);
		clean.searchParams.delete('access_token');
		clean.searchParams.delete('refresh_token');
		clean.searchParams.delete('expires_in');
		clean.searchParams.delete('error');
		clean.hash = '';
		history.replaceState(null, '', clean.toString());
	}

	return result;
}

/**
 * Processes an auth callback: extracts tokens (or error) from the given URL,
 * stores tokens in the auth store, and navigates accordingly.
 *
 * Used by both the browser login page (pass window.location.href) and the
 * Capacitor deep link handler (pass the URL from appUrlOpen). (Req 19.5, 19.6)
 *
 * @param url - Full URL or href containing callback query parameters.
 * @param cleanBrowser - When true, also removes params from window.location (web only).
 * @returns The error string if an error param was present, otherwise null.
 */
export async function handleAuthCallback(
	url: string,
	cleanBrowser = false
): Promise<string | null> {
	const result = cleanBrowser ? extractAndCleanBrowserTokens() : extractCallbackParams(url);

	if (result.error) return result.error;

	if (result.tokens) {
		authStore.setTokensFromCallback(
			result.tokens.accessToken,
			result.tokens.refreshToken,
			result.tokens.expiresIn
		);
		await goto(resolve('/' as Pathname));
		return null;
	}

	return null;
}

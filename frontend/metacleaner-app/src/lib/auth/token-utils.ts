import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { authStore } from './auth.svelte.js';

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
 * Parses auth callback query parameters from any URL string.
 * Handles both web browser (window.location.href) and Capacitor deep link URLs.
 * Checks both query params (?key=value) and hash fragments (#key=value) since
 * Supabase may redirect with tokens in either location depending on flow type.
 * Returns tokens if present, error string if an error param is present, or an empty object.
 */
export function extractCallbackParams(url: string): CallbackResult {
	let search: string;
	let hash: string;
	try {
		// Works for both full URLs and bare query strings like "?access_token=..."
		const u = url.includes('?') || url.includes('#')
			? new URL(url, 'https://x')
			: new URL(`https://x${url}`);
		search = u.search;
		hash = u.hash;
	} catch {
		return {};
	}

	// Try query params first, then fall back to hash fragment
	let params = new URLSearchParams(search);

	if (!params.get('access_token') && hash) {
		// Supabase sometimes returns tokens in hash fragment (e.g. #access_token=...&refresh_token=...)
		params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
	}

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
 * Extracts auth callback params from window.location and removes them from the
 * address bar using history.replaceState so tokens are not visible in browser history.
 * (Req 15.4, 18.7)
 */
export function extractAndCleanBrowserTokens(): CallbackResult {
	if (!browser) return {};

	const result = extractCallbackParams(window.location.href);

	const hasTokenParams =
		window.location.search.includes('access_token') ||
		window.location.search.includes('refresh_token') ||
		window.location.search.includes('error') ||
		window.location.hash.includes('access_token') ||
		window.location.hash.includes('refresh_token') ||
		window.location.hash.includes('error');

	if (hasTokenParams) {
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

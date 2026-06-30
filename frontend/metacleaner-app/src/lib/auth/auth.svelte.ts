import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { buildApiUrl } from '$lib/clients/api-config.js';
import type { SubscriptionStatus } from '$lib/types/billing.js';
import { SvelteURL } from 'svelte/reactivity';

const TOKEN_KEY = 'mc_access_token';
const REFRESH_KEY = 'mc_refresh_token';
const EXPIRES_KEY = 'mc_token_expires_at';
const REMEMBER_KEY = 'mc_remember_me';

export interface AuthUser {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
}

interface LoginRequest {
	email: string;
	password: string;
}

interface RegisterRequest {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
}

interface AuthResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	user?: AuthUser;
}

interface ApiError {
	error: string;
	message: string;
}

async function callAuthApi<T>(
	path: string,
	body: unknown,
	accessToken?: string | null
): Promise<T | null> {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

	const res = await fetch(buildApiUrl(path), {
		method: 'POST',
		headers,
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const err: ApiError = await res
			.json()
			.catch(() => ({ error: 'unknown', message: res.statusText }));
		throw Object.assign(new Error(err.message || res.statusText), {
			status: res.status,
			code: err.error
		});
	}

	if (res.status === 204 || res.headers.get('content-length') === '0') return null;
	return res.json() as Promise<T>;
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Validates that a `returnTo` redirect target is a same-origin relative path.
 * Rejects protocol-relative URLs (//evil.tld), backslash tricks (/\evil),
 * and anything containing a scheme (https://), preventing open-redirect phishing.
 */
function _safeReturnTo(raw: string | null): string {
	if (!raw) return '/';
	let p: string;
	try {
		p = decodeURIComponent(raw);
	} catch {
		return '/';
	}
	// Must start with exactly one '/' and not be '//' or '/\'
	if (!p.startsWith('/') || p.startsWith('//') || p.startsWith('/\\')) return '/';
	return p;
}

// ─── Reactive state ──────────────────────────────────────────────

let _accessToken = $state<string | null>(null);
let _refreshToken = $state<string | null>(null);
let _user = $state<AuthUser | null>(null);
let _subscription = $state<SubscriptionStatus | null>(null);
let _isLoading = $state(false);
let _isAuthReady = $state(false);

const _isAuthenticated = $derived(_accessToken !== null);

// Session expiry when "remember me" is OFF (1 hour in ms)
const SHORT_SESSION_MS = 60 * 60 * 1000;

function _persist(access: string, refresh: string, expiresIn: number): void {
	_accessToken = access;
	_refreshToken = refresh;
	if (browser) {
		const rememberMe = localStorage.getItem(REMEMBER_KEY) !== 'false';
		// When not remembering, cap expiry to 1 hour regardless of server-provided value
		const effectiveExpiresMs = rememberMe
			? expiresIn * 1000
			: Math.min(expiresIn * 1000, SHORT_SESSION_MS);

		// Access token is kept in memory only (not in localStorage) to prevent
		// exfiltration by XSS or a compromised dependency. The refresh token persists
		// the session across page loads via a silent refresh on restore.
		localStorage.setItem(REFRESH_KEY, refresh);
		localStorage.setItem(EXPIRES_KEY, String(Date.now() + effectiveExpiresMs));
	}
}

function _clear(): void {
	_accessToken = null;
	_refreshToken = null;
	_user = null;
	_subscription = null;
	if (browser) {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_KEY);
		localStorage.removeItem(EXPIRES_KEY);
		localStorage.removeItem(REMEMBER_KEY);
	}
}

async function _fetchSubscription(accessToken: string): Promise<void> {
	try {
		const res = await fetch(buildApiUrl('/api/billing/subscription'), {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		if (res.ok) {
			_subscription = (await res.json()) as SubscriptionStatus;
		}
	} catch {
		// Non-fatal — subscription status unavailable
	}
}

function _restore(): void {
	if (!browser) {
		_isAuthReady = true;
		return;
	}

	// Check if URL contains auth callback tokens (magic link / OAuth redirect).
	// Process them before checking localStorage so auth guard sees the session immediately.
	// Guard with typeof window to avoid ReferenceError in SSR/node test environments where
	// browser is mocked as true but window is not available.
	const href = typeof window !== 'undefined' ? window.location.href : '';
	const hasCallbackTokens = href.includes('access_token') && href.includes('refresh_token');
	const hasHashTokens =
		typeof window !== 'undefined' &&
		window.location.hash.includes('access_token') &&
		window.location.hash.includes('refresh_token');

	if (hasCallbackTokens || hasHashTokens) {
		let params: URLSearchParams;
		// Prefer the hash fragment: tokens in the fragment are NOT sent to the server and
		// do not appear in access logs or the Referer header. Query-string tokens may be
		// recorded in reverse-proxy logs before this cleanup runs.
		if (hasHashTokens) {
			params = new URLSearchParams(window.location.hash.slice(1));
		} else {
			// Query-string fallback (backend should be configured to use hash fragment instead)
			params = new URLSearchParams(window.location.search);
		}

		const accessToken = params.get('access_token');
		const refreshToken = params.get('refresh_token');
		const expiresIn = Number(params.get('expires_in') ?? '3600');

		if (accessToken && refreshToken) {
			_persist(accessToken, refreshToken, expiresIn);
			// Clean URL (remove tokens from address bar)
			const clean = new SvelteURL(window.location.href);
			clean.searchParams.delete('access_token');
			clean.searchParams.delete('refresh_token');
			clean.searchParams.delete('expires_in');
			clean.hash = '';
			history.replaceState(null, '', clean.toString());
			_isAuthReady = true;
			_fetchSubscription(accessToken);
			return;
		}
	}

	// Access token is never persisted to localStorage — purge any value left by older code.
	localStorage.removeItem(TOKEN_KEY);

	const storedRefresh = localStorage.getItem(REFRESH_KEY);
	const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) ?? '0');

	if (storedRefresh) {
		const rememberMe = localStorage.getItem(REMEMBER_KEY) !== 'false';
		if (!rememberMe && expiresAt > 0 && expiresAt <= Date.now()) {
			// Short session (remember-me off) has expired — require re-login.
			_clear();
			_isAuthReady = true;
			return;
		}
		// Silently exchange the refresh token for a fresh access token.
		_refreshToken = storedRefresh;
		refresh()
			.then(() => {
				_isAuthReady = true;
				if (_accessToken) _fetchSubscription(_accessToken);
			})
			.catch(() => {
				_clear();
				_isAuthReady = true;
			});
	} else {
		_clear();
		_isAuthReady = true;
	}
}

// Restore on module init (browser only)
_restore();

// Proactive refresh: every 30s, refresh token if within 60s of expiry
if (browser) {
	setInterval(async () => {
		if (!_refreshToken) return;
		// Don't proactively refresh for short sessions (remember me = false)
		const rememberMe = localStorage.getItem(REMEMBER_KEY) !== 'false';
		if (!rememberMe) return;
		const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) ?? '0');
		if (expiresAt > 0 && expiresAt - Date.now() < 60_000) {
			await refresh().catch(() => {});
		}
	}, 30_000);
}

// ─── Actions ─────────────────────────────────────────────────────

async function login(email: string, password: string, rememberMe = true): Promise<void> {
	_isLoading = true;
	try {
		// Set remember preference before persisting tokens
		if (browser) {
			localStorage.setItem(REMEMBER_KEY, String(rememberMe));
		}
		const data = await callAuthApi<AuthResponse>('/api/auth/login', {
			email,
			password
		} satisfies LoginRequest);
		if (!data) throw new Error('Login returned empty response');
		_user = data.user ?? null;
		_persist(data.access_token, data.refresh_token, data.expires_in);
		await _fetchSubscription(data.access_token);
		const returnTo =
			typeof window !== 'undefined'
				? new URLSearchParams(window.location.search).get('returnTo')
				: null;
		const destination = resolve(_safeReturnTo(returnTo) as Pathname);
		await goto(destination);
	} finally {
		_isLoading = false;
	}
}

async function register(
	email: string,
	password: string,
	firstName: string,
	lastName: string
): Promise<void> {
	_isLoading = true;
	try {
		await callAuthApi('/api/auth/register', {
			email,
			password,
			first_name: firstName,
			last_name: lastName
		} satisfies RegisterRequest);
	} finally {
		_isLoading = false;
	}
}

async function logout(): Promise<void> {
	_isLoading = true;
	try {
		await callAuthApi('/api/auth/logout', {}, _accessToken).catch(() => {
			// Always clear locally even if server call fails (Req 4.4)
		});
	} finally {
		_clear();
		_isLoading = false;
		await goto(resolve('/login' as Pathname));
	}
}

async function refresh(): Promise<void> {
	const token = _refreshToken ?? (browser ? localStorage.getItem(REFRESH_KEY) : null);
	if (!token) throw new Error('No refresh token');
	const data = await callAuthApi<AuthResponse>('/api/auth/refresh', { refresh_token: token });
	if (!data) throw new Error('Refresh returned empty response');
	_user = data.user ?? _user;
	_persist(data.access_token, data.refresh_token, data.expires_in);
}

function setTokensFromCallback(
	accessToken: string,
	refreshToken: string,
	expiresIn: number,
	user?: AuthUser
): void {
	_user = user ?? null;
	_persist(accessToken, refreshToken, expiresIn);
}

async function fetchSubscription(): Promise<void> {
	if (_accessToken) {
		await _fetchSubscription(_accessToken);
	}
}

// ─── Public store ────────────────────────────────────────────────

export const authStore = {
	get accessToken(): string | null {
		return _accessToken;
	},
	get refreshToken(): string | null {
		return _refreshToken;
	},
	get user(): AuthUser | null {
		return _user;
	},
	get subscription(): SubscriptionStatus | null {
		return _subscription;
	},
	get isAuthenticated(): boolean {
		return _isAuthenticated;
	},
	get isLoading(): boolean {
		return _isLoading;
	},
	get isAuthReady(): boolean {
		return _isAuthReady;
	},
	get expiresAt(): number {
		if (!browser) return 0;
		return Number(localStorage.getItem(EXPIRES_KEY) ?? '0');
	},
	login,
	register,
	logout,
	refresh,
	fetchSubscription,
	setTokensFromCallback
};

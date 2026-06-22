import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { buildApiUrl } from '$lib/clients/api-config.js';

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

// ─── Reactive state ──────────────────────────────────────────────

let _accessToken = $state<string | null>(null);
let _refreshToken = $state<string | null>(null);
let _user = $state<AuthUser | null>(null);
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

		localStorage.setItem(TOKEN_KEY, access);
		localStorage.setItem(REFRESH_KEY, refresh);
		localStorage.setItem(EXPIRES_KEY, String(Date.now() + effectiveExpiresMs));
	}
}

function _clear(): void {
	_accessToken = null;
	_refreshToken = null;
	_user = null;
	if (browser) {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_KEY);
		localStorage.removeItem(EXPIRES_KEY);
		localStorage.removeItem(REMEMBER_KEY);
	}
}

function _restore(): void {
	if (!browser) {
		_isAuthReady = true;
		return;
	}
	const token = localStorage.getItem(TOKEN_KEY);
	const storedRefresh = localStorage.getItem(REFRESH_KEY);
	const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) ?? '0');

	if (token && expiresAt > Date.now()) {
		_accessToken = token;
		_refreshToken = storedRefresh;
		_isAuthReady = true;
	} else if (storedRefresh) {
		// Access token expired but refresh token exists — attempt silent refresh.
		// If remember me is OFF and token expired, don't refresh — session is over.
		const rememberMe = localStorage.getItem(REMEMBER_KEY) !== 'false';
		if (!rememberMe) {
			_clear();
			_isAuthReady = true;
			return;
		}
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(EXPIRES_KEY);
		_refreshToken = storedRefresh;
		refresh()
			.then(() => {
				_isAuthReady = true;
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
		const returnTo = browser
			? new URLSearchParams(window.location.search).get('returnTo')
			: null;
		const destination = returnTo ? decodeURIComponent(returnTo) : resolve('/' as Pathname);
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
	setTokensFromCallback
};

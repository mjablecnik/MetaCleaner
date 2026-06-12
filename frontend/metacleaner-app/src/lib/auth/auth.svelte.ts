import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { buildApiUrl } from '$lib/clients/api-config.js';

const TOKEN_KEY = 'mc_access_token';
const REFRESH_KEY = 'mc_refresh_token';
const EXPIRES_KEY = 'mc_token_expires_at';

export interface AuthUser {
	id: string;
	email: string;
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
): Promise<T> {
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

	if (res.status === 204 || res.headers.get('content-length') === '0') return {} as T;
	return res.json() as Promise<T>;
}

// ─── Reactive state ──────────────────────────────────────────────

let _accessToken = $state<string | null>(null);
let _refreshToken = $state<string | null>(null);
let _user = $state<AuthUser | null>(null);
let _isLoading = $state(false);

const _isAuthenticated = $derived(_accessToken !== null);

function _persist(access: string, refresh: string, expiresIn: number): void {
	_accessToken = access;
	_refreshToken = refresh;
	if (browser) {
		localStorage.setItem(TOKEN_KEY, access);
		localStorage.setItem(REFRESH_KEY, refresh);
		localStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
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
	}
}

function _restore(): void {
	if (!browser) return;
	const token = localStorage.getItem(TOKEN_KEY);
	const refresh = localStorage.getItem(REFRESH_KEY);
	const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) ?? '0');
	if (token && expiresAt > Date.now()) {
		_accessToken = token;
		_refreshToken = refresh;
	} else {
		_clear();
	}
}

// Restore on module init (browser only)
_restore();

// ─── Actions ─────────────────────────────────────────────────────

async function login(email: string, password: string): Promise<void> {
	_isLoading = true;
	try {
		const data = await callAuthApi<AuthResponse>('/api/auth/login', {
			email,
			password
		} satisfies LoginRequest);
		_user = data.user ?? null;
		_persist(data.access_token, data.refresh_token, data.expires_in);
		await goto(resolve('/' as Pathname));
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

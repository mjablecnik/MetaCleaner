import { browser } from '$app/environment';
import { buildApiUrl } from '$lib/clients/api-config.js';
import { authStore } from './auth.svelte.js';

const REFRESH_BUFFER_MS = 60_000;

// Single-flight lock: all callers during an in-progress refresh await the same promise.
let refreshPromise: Promise<void> | null = null;

function isProtectedEndpoint(path: string): boolean {
	if (path === '/api/auth/me') return true;
	return !path.startsWith('/api/auth/') && path !== '/api/health';
}

async function doRefreshWithRetry(): Promise<void> {
	try {
		await authStore.refresh();
	} catch (err) {
		if (err instanceof TypeError) {
			// Network error — retry once after 5s (Req 3.5)
			await new Promise<void>((res) => setTimeout(res, 5_000));
			await authStore.refresh();
		} else {
			throw err;
		}
	}
}

async function ensureFreshToken(): Promise<void> {
	if (!browser) return;

	const { accessToken, refreshToken, expiresAt } = authStore;
	if (!accessToken || !refreshToken) return;

	// Skip refresh if token is still fresh
	if (expiresAt - Date.now() > REFRESH_BUFFER_MS) return;

	// Single-flight: reuse in-flight refresh instead of starting a new one
	if (!refreshPromise) {
		refreshPromise = doRefreshWithRetry().finally(() => {
			refreshPromise = null;
		});
	}

	await refreshPromise;
}

/**
 * Authenticated fetch wrapper. Injects Bearer token on protected endpoints and
 * proactively refreshes the token when it is within 60 s of expiry (Req 12.2,
 * 12.3, 12.7, 3.3, 3.4, 3.5). On refresh failure the session is cleared and
 * the user is redirected to /login by authStore.logout().
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
	const isProtected = isProtectedEndpoint(path);

	if (browser && isProtected) {
		try {
			await ensureFreshToken();
		} catch {
			// Refresh failed (401 from refresh endpoint, or network after retry).
			// authStore.logout() clears tokens and redirects to /login (Req 3.4, 12.4).
			await authStore.logout();
			throw new Error('Session expired');
		}
	}

	const headers: Record<string, string> = {
		...(init.headers as Record<string, string> | undefined)
	};

	const token = authStore.accessToken;
	if (token && isProtected) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return fetch(buildApiUrl(path), { ...init, headers });
}

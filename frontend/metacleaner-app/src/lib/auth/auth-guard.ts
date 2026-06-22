import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { authStore } from './auth.svelte.js';

function waitForAuthReady(): Promise<void> {
	if (authStore.isAuthReady) return Promise.resolve();
	return new Promise((resolve) => {
		const id = setInterval(() => {
			if (authStore.isAuthReady) {
				clearInterval(id);
				resolve();
			}
		}, 50);
	});
}

/**
 * Call from a +layout.ts load() to block unauthenticated access.
 * Redirects to /login if no valid token is present, preserving returnTo for post-login redirect.
 * Waits for async token restore/refresh to complete before deciding.
 */
export async function guardProtectedRoute(returnTo?: string): Promise<void> {
	if (!browser) return;
	await waitForAuthReady();
	if (!authStore.isAuthenticated) {
		const loginPath = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login';
		redirect(302, resolve(loginPath as Pathname));
	}
}

/**
 * Call from a +layout.ts load() on auth pages (login, register, forgot-password).
 * Redirects already-authenticated users to the main app.
 * Exception: /email-verified is allowed for authenticated users so that the
 * email confirmation callback can land and display the success page.
 * Waits for async token restore/refresh to complete before deciding.
 */
export async function guardAuthRoute(): Promise<void> {
	if (!browser) return;
	await waitForAuthReady();
	if (authStore.isAuthenticated && window.location.pathname !== '/email-verified') {
		redirect(302, resolve('/' as Pathname));
	}
}

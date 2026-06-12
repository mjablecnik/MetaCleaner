import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { authStore } from './auth.svelte.js';

/**
 * Call from a +layout.ts load() to block unauthenticated access.
 * Redirects to /login if no valid token is present.
 */
export function guardProtectedRoute(): void {
	if (!browser) return;
	if (!authStore.isAuthenticated) {
		redirect(302, resolve('/login' as Pathname));
	}
}

/**
 * Call from a +layout.ts load() on auth pages (login, register, forgot-password).
 * Redirects already-authenticated users to the main app.
 */
export function guardAuthRoute(): void {
	if (!browser) return;
	if (authStore.isAuthenticated) {
		redirect(302, resolve('/' as Pathname));
	}
}

import { guardProtectedRoute } from '$lib/auth/auth-guard.js';

export const prerender = false;

export async function load() {
	await guardProtectedRoute('/docs');
}

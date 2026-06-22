import { guardProtectedRoute } from '$lib/auth/auth-guard.js';

export async function load() {
	await guardProtectedRoute('/docs');
}

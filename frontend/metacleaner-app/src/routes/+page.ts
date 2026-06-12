import { guardProtectedRoute } from '$lib/auth/auth-guard.js';

export function load() {
	guardProtectedRoute();
}

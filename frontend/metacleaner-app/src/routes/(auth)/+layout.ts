import { guardAuthRoute } from '$lib/auth/auth-guard.js';

export function load() {
	guardAuthRoute();
}

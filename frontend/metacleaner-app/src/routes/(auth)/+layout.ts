import { guardAuthRoute } from '$lib/auth/auth-guard.js';

export async function load() {
	await guardAuthRoute();
}

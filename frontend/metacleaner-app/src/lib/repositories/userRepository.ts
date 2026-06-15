import { apiFetch } from '$lib/auth/api-client.js';
import { authStore } from '$lib/auth/auth.svelte.js';

export interface User {
	name: string;
	email: string;
}

interface ProfileResponse {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	subscription_type: string;
	credits: number;
}

export async function getCurrentUser(): Promise<User> {
	if (!authStore.isAuthenticated) {
		return { name: '', email: '' };
	}
	const res = await apiFetch('/api/auth/me');
	if (!res.ok) {
		return { name: '', email: '' };
	}
	const profile: ProfileResponse = await res.json();
	const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
	return { name, email: profile.email };
}

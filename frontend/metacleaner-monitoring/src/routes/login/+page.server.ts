import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types.js';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = String(data.get('password') ?? '');
		const secret = env.DASHBOARD_SESSION_SECRET;

		if (!secret || !password || password !== secret) {
			return fail(401, { error: true });
		}

		cookies.set('mc_session', secret, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 8
		});

		redirect(303, '/');
	}
} satisfies Actions;

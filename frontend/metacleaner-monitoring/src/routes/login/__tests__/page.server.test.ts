const { mockEnv } = vi.hoisted(() => {
	const mockEnv: Record<string, string | undefined> = {
		DASHBOARD_SESSION_SECRET: 'test-secret'
	};
	return { mockEnv };
});

vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from '../+page.server.js';

function makeRequest(password: string) {
	const formData = new FormData();
	formData.set('password', password);
	return { formData: async () => formData };
}

function makeCookies() {
	return { set: vi.fn() };
}

beforeEach(() => {
	mockEnv.DASHBOARD_SESSION_SECRET = 'test-secret';
});

describe('login default action — fail cases', () => {
	it('returns fail(401) when DASHBOARD_SESSION_SECRET is not set', async () => {
		delete mockEnv.DASHBOARD_SESSION_SECRET;
		const result = await actions.default({
			request: makeRequest('test-secret'),
			cookies: makeCookies()
		} as never);
		expect(result).toMatchObject({ status: 401 });
	});

	it('does not set cookie when DASHBOARD_SESSION_SECRET is missing', async () => {
		delete mockEnv.DASHBOARD_SESSION_SECRET;
		const cookies = makeCookies();
		await actions.default({ request: makeRequest('test-secret'), cookies } as never);
		expect(cookies.set).not.toHaveBeenCalled();
	});

	it('returns fail(401) when password is empty', async () => {
		const result = await actions.default({
			request: makeRequest(''),
			cookies: makeCookies()
		} as never);
		expect(result).toMatchObject({ status: 401 });
	});

	it('does not set cookie when password is empty', async () => {
		const cookies = makeCookies();
		await actions.default({ request: makeRequest(''), cookies } as never);
		expect(cookies.set).not.toHaveBeenCalled();
	});

	it('returns fail(401) when password does not match secret', async () => {
		const result = await actions.default({
			request: makeRequest('wrong-password'),
			cookies: makeCookies()
		} as never);
		expect(result).toMatchObject({ status: 401 });
	});

	it('does not set cookie when password is wrong', async () => {
		const cookies = makeCookies();
		await actions.default({ request: makeRequest('wrong-password'), cookies } as never);
		expect(cookies.set).not.toHaveBeenCalled();
	});
});

describe('login default action — success case', () => {
	it('sets mc_session cookie with exact options on correct password', async () => {
		const cookies = makeCookies();
		try {
			await actions.default({ request: makeRequest('test-secret'), cookies } as never);
		} catch {
			// redirect throws — expected
		}
		expect(cookies.set).toHaveBeenCalledWith('mc_session', 'test-secret', {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 28800
		});
	});

	it('throws redirect(303, "/") on correct password', async () => {
		const cookies = makeCookies();
		await expect(
			actions.default({ request: makeRequest('test-secret'), cookies } as never)
		).rejects.toMatchObject({ status: 303, location: '/' });
	});
});

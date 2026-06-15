import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockApiFetch, mockAuthState } = vi.hoisted(() => ({
	mockApiFetch: vi.fn<() => Promise<Response>>(),
	mockAuthState: { isAuthenticated: false }
}));

vi.mock('$lib/auth/api-client.js', () => ({ apiFetch: mockApiFetch }));
vi.mock('$lib/auth/auth.svelte.js', () => ({ authStore: mockAuthState }));

const { getCurrentUser } = await import('../userRepository.js');

describe('getCurrentUser', () => {
	beforeEach(() => {
		mockApiFetch.mockReset();
		mockAuthState.isAuthenticated = false;
	});

	// ─── Unauthenticated ─────────────────────────────────────────────────────

	it('returns empty user without fetching when not authenticated', async () => {
		mockAuthState.isAuthenticated = false;
		const user = await getCurrentUser();
		expect(user).toEqual({ name: '', email: '' });
		expect(mockApiFetch).not.toHaveBeenCalled();
	});

	// ─── Non-ok response ─────────────────────────────────────────────────────

	it('returns empty user when apiFetch responds with 401', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(new Response('', { status: 401 }));
		const user = await getCurrentUser();
		expect(user).toEqual({ name: '', email: '' });
	});

	it('returns empty user when apiFetch responds with 500', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(new Response('', { status: 500 }));
		const user = await getCurrentUser();
		expect(user).toEqual({ name: '', email: '' });
	});

	it('returns empty user when apiFetch responds with 403', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(new Response('', { status: 403 }));
		const user = await getCurrentUser();
		expect(user).toEqual({ name: '', email: '' });
	});

	// ─── Name composition ────────────────────────────────────────────────────

	it('composes name from first_name and last_name on success', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(
			new Response(
				JSON.stringify({
					id: 'u-1',
					first_name: 'Alice',
					last_name: 'Novak',
					email: 'alice@example.com',
					subscription_type: 'free',
					credits: 3
				}),
				{ status: 200 }
			)
		);
		const user = await getCurrentUser();
		expect(user.name).toBe('Alice Novak');
		expect(user.email).toBe('alice@example.com');
	});

	it('uses only first_name when last_name is empty string', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(
			new Response(
				JSON.stringify({
					id: 'u-2',
					first_name: 'Alice',
					last_name: '',
					email: 'alice@example.com',
					subscription_type: 'free',
					credits: 3
				}),
				{ status: 200 }
			)
		);
		const user = await getCurrentUser();
		expect(user.name).toBe('Alice');
	});

	it('uses only last_name when first_name is empty string', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(
			new Response(
				JSON.stringify({
					id: 'u-3',
					first_name: '',
					last_name: 'Novak',
					email: 'novak@example.com',
					subscription_type: 'free',
					credits: 3
				}),
				{ status: 200 }
			)
		);
		const user = await getCurrentUser();
		expect(user.name).toBe('Novak');
	});

	it('returns empty name when both first_name and last_name are empty', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(
			new Response(
				JSON.stringify({
					id: 'u-4',
					first_name: '',
					last_name: '',
					email: 'noname@example.com',
					subscription_type: 'pro',
					credits: 10
				}),
				{ status: 200 }
			)
		);
		const user = await getCurrentUser();
		expect(user.name).toBe('');
		expect(user.email).toBe('noname@example.com');
	});

	it('maps email correctly from profile response', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(
			new Response(
				JSON.stringify({
					id: 'u-5',
					first_name: 'Bob',
					last_name: 'Smith',
					email: 'bob@domain.org',
					subscription_type: 'pro',
					credits: 5
				}),
				{ status: 200 }
			)
		);
		const user = await getCurrentUser();
		expect(user.email).toBe('bob@domain.org');
	});

	it('calls apiFetch with the /api/auth/me path', async () => {
		mockAuthState.isAuthenticated = true;
		mockApiFetch.mockResolvedValue(
			new Response(
				JSON.stringify({
					id: 'u-6',
					first_name: 'Test',
					last_name: 'User',
					email: 't@t.com',
					subscription_type: 'free',
					credits: 1
				}),
				{ status: 200 }
			)
		);
		await getCurrentUser();
		expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/me');
	});
});

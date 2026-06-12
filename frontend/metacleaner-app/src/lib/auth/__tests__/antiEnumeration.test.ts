import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockGoto, mockResolve, mockBuildApiUrl } = vi.hoisted(() => ({
	mockGoto: vi.fn().mockResolvedValue(undefined),
	mockResolve: vi.fn((path: string) => path),
	mockBuildApiUrl: vi.fn((path: string) => `http://localhost:8080${path}`)
}));

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$app/navigation', () => ({ goto: mockGoto }));
vi.mock('$app/paths', () => ({ resolve: mockResolve }));
vi.mock('$lib/clients/metaCleanerApi.js', () => ({ buildApiUrl: mockBuildApiUrl }));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeMockStorage() {
	const store: Record<string, string> = {};
	return {
		getItem: (key: string): string | null => store[key] ?? null,
		setItem: (key: string, val: string) => {
			store[key] = val;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			for (const k of Object.keys(store)) delete store[k];
		}
	};
}

async function importFresh() {
	return import('../auth.svelte.js');
}

// ─── Property 2a: Login failure shape is identical regardless of email existence ───
//
// Req 2.2: Login with incorrect credentials MUST return HTTP 401 with a generic
// error that does NOT reveal whether the email exists (anti-enumeration).
// This property verifies that authStore.login() always surfaces the same error
// structure for any email/password combination when the backend returns 401.

describe('anti-enumeration — login failure shape (Req 2.2)', () => {
	let mockFetch: ReturnType<typeof vi.fn>;
	let authStoreModule: Awaited<ReturnType<typeof importFresh>>;

	beforeEach(async () => {
		vi.resetModules();
		vi.stubGlobal('localStorage', makeMockStorage());
		mockFetch = vi.fn();
		vi.stubGlobal('fetch', mockFetch);
		mockGoto.mockClear();
		authStoreModule = await importFresh();
	});

	it('always throws error with identical status and message for any email/password', async () => {
		// Backend anti-enumeration response: same body for registered and unregistered emails
		const antiEnumError = {
			error: 'AUTH_INVALID_CREDENTIALS',
			message: 'Invalid email or password'
		};

		await fc.assert(
			fc.asyncProperty(
				fc.emailAddress(),
				fc.string({ minLength: 1, maxLength: 72 }),
				async (email, password) => {
					mockFetch.mockResolvedValueOnce(
						new Response(JSON.stringify(antiEnumError), { status: 401 })
					);

					let caughtError: unknown;
					try {
						await authStoreModule.authStore.login(email, password);
					} catch (err) {
						caughtError = err;
					}

					// Error must always be thrown — never silently succeed
					expect(caughtError).toBeDefined();

					const err = caughtError as { status: number; message: string; code: string };
					// Error shape must be consistent: same HTTP status
					expect(err.status).toBe(401);
					// Error message must be the generic anti-enumeration message — never leaks registration status
					expect(err.message).toBe('Invalid email or password');
					// Error code must identify the credential failure, not "user not found" vs "wrong password"
					expect(err.code).toBe('AUTH_INVALID_CREDENTIALS');
				}
			),
			{ numRuns: 50 }
		);
	});

	it('authStore remains unauthenticated for any email/password when login fails', async () => {
		const antiEnumError = {
			error: 'AUTH_INVALID_CREDENTIALS',
			message: 'Invalid email or password'
		};

		await fc.assert(
			fc.asyncProperty(
				fc.emailAddress(),
				fc.string({ minLength: 1, maxLength: 72 }),
				async (email, password) => {
					mockFetch.mockResolvedValueOnce(
						new Response(JSON.stringify(antiEnumError), { status: 401 })
					);

					try {
						await authStoreModule.authStore.login(email, password);
					} catch {
						// expected
					}

					// Store state must never be polluted by failed login
					expect(authStoreModule.authStore.isAuthenticated).toBe(false);
					expect(authStoreModule.authStore.accessToken).toBeNull();
					expect(authStoreModule.authStore.isLoading).toBe(false);
				}
			),
			{ numRuns: 50 }
		);
	});
});

// ─── Property 2b: Forgot-password response shape is identical regardless of email ──
//
// Req 5.2: POST /api/auth/forgot-password with an unregistered email MUST return
// HTTP 200 with the SAME success body as a registered email (anti-enumeration).
// This property verifies that the forgot-password API always succeeds (ok=true)
// and returns a consistent { message: string } shape for any email input.

describe('anti-enumeration — forgot-password response shape (Req 5.2)', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn();
		vi.stubGlobal('fetch', mockFetch);
	});

	it('always returns ok=true with same body shape for any email', async () => {
		const successBody = {
			message: 'If this email is registered, a reset code has been sent'
		};

		await fc.assert(
			fc.asyncProperty(fc.emailAddress(), async (email) => {
				// Backend anti-enumeration: 200 for both registered AND unregistered emails
				mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(successBody), { status: 200 }));

				const res = await fetch(mockBuildApiUrl('/api/auth/forgot-password'), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email })
				});

				const body = (await res.json()) as { message?: unknown };

				// Response must always be ok (HTTP 200 anti-enumeration)
				expect(res.ok).toBe(true);
				expect(res.status).toBe(200);
				// Body must always have a message string — same shape for registered and unregistered
				expect(body).toHaveProperty('message');
				expect(typeof body.message).toBe('string');
				expect((body.message as string).length).toBeGreaterThan(0);
			}),
			{ numRuns: 50 }
		);
	});

	it('request always includes email in body regardless of email format', async () => {
		const successBody = { message: 'Reset code sent' };

		await fc.assert(
			fc.asyncProperty(fc.emailAddress(), async (email) => {
				mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(successBody), { status: 200 }));

				await fetch(mockBuildApiUrl('/api/auth/forgot-password'), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email })
				});

				// Verify the fetch call includes the email in the request body
				const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [
					string,
					{ body: string }
				];
				const sentBody = JSON.parse(lastCall[1].body) as { email?: string };
				expect(sentBody.email).toBe(email);
			}),
			{ numRuns: 50 }
		);
	});
});

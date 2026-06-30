// Use vi.hoisted so mockEnv is available in the vi.mock factory (hoisted before imports)
const { mockEnv } = vi.hoisted(() => {
	const mockEnv: Record<string, string | undefined> = {
		SUPABASE_URL: 'https://test.supabase.co',
		SUPABASE_SERVICE_KEY: 'test-service-key',
		DASHBOARD_SESSION_SECRET: 'test-session-secret'
	};
	return { mockEnv };
});

vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

// Prevent process.exit at module load; getServiceConfigs is called eagerly in hooks.server.ts
vi.mock('$lib/server/config.js', () => ({
	getServiceConfigs: vi.fn(() => ({
		fly: { configured: false, missingVars: ['FLY_API_TOKEN'] },
		cloudflare: { configured: false, missingVars: ['CLOUDFLARE_API_TOKEN'] },
		stripe: { configured: false, missingVars: ['STRIPE_SECRET_KEY'] },
		supabase: {
			configured: true,
			config: { url: 'https://test.supabase.co', serviceKey: 'test-key' }
		},
		sentry: { configured: false, missingVars: ['SENTRY_AUTH_TOKEN'] }
	}))
}));

// Replace real sequence (which requires SvelteKit request-store context) with a simple chainer
vi.mock('@sveltejs/kit/hooks', () => ({
	sequence:
		(
			...handlers: Array<(input: { event: unknown; resolve: (e: unknown) => unknown }) => unknown>
		) =>
		({ event, resolve }: { event: unknown; resolve: (e: unknown) => unknown }) => {
			function applyHandle(i: number, evt: unknown): unknown {
				if (i >= handlers.length) return resolve(evt);
				return handlers[i]({ event: evt, resolve: (e: unknown) => applyHandle(i + 1, e) });
			}
			return applyHandle(0, event);
		}
}));

// Pass-through paraglide middleware to avoid real locale/dir logic in tests
vi.mock('$lib/paraglide/server', () => ({
	paraglideMiddleware: (
		req: unknown,
		callback: (opts: { request: unknown; locale: string }) => unknown
	) => callback({ request: req, locale: 'en' })
}));
vi.mock('$lib/paraglide/runtime', () => ({
	getTextDirection: () => 'ltr'
}));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handle } from '../../../hooks.server.js';

// Unique IPs prevent rlMap state from bleeding between tests
let _ipCounter = 0;
function uniqueIp(): string {
	return `10.0.${(_ipCounter++ % 254) + 1}.1`;
}

function makeEvent(opts: { pathname: string; ip?: string; cookies?: Record<string, string> }) {
	const { pathname, ip = uniqueIp(), cookies = {} } = opts;
	return {
		url: new URL(`http://localhost${pathname}`),
		cookies: { get: (name: string) => cookies[name] ?? null },
		getClientAddress: () => ip,
		request: new Request(`http://localhost${pathname}`)
	};
}

const resolve = vi.fn(() => Promise.resolve(new Response('ok', { status: 200 })));

beforeEach(() => {
	resolve.mockClear();
	// Restore default env values
	mockEnv.DASHBOARD_SESSION_SECRET = 'test-session-secret';
	mockEnv.SUPABASE_URL = 'https://test.supabase.co';
	mockEnv.SUPABASE_SERVICE_KEY = 'test-service-key';
});

afterEach(() => {
	vi.useRealTimers();
});

describe('requireAuth — bypass paths', () => {
	it('calls resolve for /login without checking auth', async () => {
		const event = makeEvent({ pathname: '/login' });
		await handle({ event, resolve } as never);
		expect(resolve).toHaveBeenCalled();
	});

	it('calls resolve for /_app/ paths without checking auth', async () => {
		const event = makeEvent({ pathname: '/_app/immutable/chunk.js' });
		await handle({ event, resolve } as never);
		expect(resolve).toHaveBeenCalled();
	});

	it('calls resolve for /favicon.ico without checking auth', async () => {
		const event = makeEvent({ pathname: '/favicon.ico' });
		await handle({ event, resolve } as never);
		expect(resolve).toHaveBeenCalled();
	});

	it('calls resolve for /favicon.png without checking auth', async () => {
		const event = makeEvent({ pathname: '/favicon.png' });
		await handle({ event, resolve } as never);
		expect(resolve).toHaveBeenCalled();
	});
});

describe('requireAuth — auth enforcement', () => {
	it('throws redirect 303 to /login when DASHBOARD_SESSION_SECRET is not set', async () => {
		delete mockEnv.DASHBOARD_SESSION_SECRET;
		const event = makeEvent({ pathname: '/dashboard' });

		await expect(handle({ event, resolve } as never)).rejects.toMatchObject({
			status: 303,
			location: '/login'
		});
	});

	it('throws redirect 303 to /login when mc_session cookie is absent', async () => {
		const event = makeEvent({ pathname: '/dashboard', cookies: {} });

		await expect(handle({ event, resolve } as never)).rejects.toMatchObject({
			status: 303,
			location: '/login'
		});
	});

	it('throws redirect 303 to /login when mc_session cookie does not match the secret', async () => {
		const event = makeEvent({
			pathname: '/dashboard',
			cookies: { mc_session: 'wrong-secret-value' }
		});

		await expect(handle({ event, resolve } as never)).rejects.toMatchObject({
			status: 303,
			location: '/login'
		});
	});

	it('calls resolve when mc_session cookie matches DASHBOARD_SESSION_SECRET', async () => {
		const event = makeEvent({
			pathname: '/dashboard',
			cookies: { mc_session: 'test-session-secret' }
		});

		await handle({ event, resolve } as never);
		expect(resolve).toHaveBeenCalled();
	});
});

describe('rateLimit', () => {
	it('allows the first 60 requests from the same IP and blocks the 61st with 429', async () => {
		const ip = uniqueIp();
		const makeRLEvent = () => makeEvent({ pathname: '/login', ip });

		for (let i = 0; i < 60; i++) {
			const response = await handle({ event: makeRLEvent(), resolve } as never);
			expect(response.status).not.toBe(429);
		}

		const response61 = await handle({ event: makeRLEvent(), resolve } as never);
		expect(response61.status).toBe(429);
	});

	it('429 response includes a Retry-After header', async () => {
		const ip = uniqueIp();
		const makeRLEvent = () => makeEvent({ pathname: '/login', ip });

		for (let i = 0; i < 61; i++) {
			await handle({ event: makeRLEvent(), resolve } as never);
		}

		const response = await handle({ event: makeRLEvent(), resolve } as never);
		expect(response.status).toBe(429);
		expect(response.headers.get('Retry-After')).toBeTruthy();
	});

	it('rate limits are per-IP — a different IP is not affected', async () => {
		const ipA = uniqueIp();
		const ipB = uniqueIp();

		// Exhaust limit for IP A
		for (let i = 0; i < 61; i++) {
			await handle({ event: makeEvent({ pathname: '/login', ip: ipA }), resolve } as never);
		}

		// IP B should not be affected
		const ipBResponse = await handle({
			event: makeEvent({ pathname: '/login', ip: ipB }),
			resolve
		} as never);
		expect(ipBResponse.status).not.toBe(429);
	});

	it('resets the counter after the 60-second window expires', async () => {
		vi.useFakeTimers();

		const ip = uniqueIp();
		const makeRLEvent = () => makeEvent({ pathname: '/login', ip });

		// Exhaust the rate limit
		for (let i = 0; i < 61; i++) {
			await handle({ event: makeRLEvent(), resolve } as never);
		}

		// Verify it's blocked
		const blockedResponse = await handle({ event: makeRLEvent(), resolve } as never);
		expect(blockedResponse.status).toBe(429);

		// Advance past the 60-second window
		vi.advanceTimersByTime(60_001);

		// Counter should be reset — next request passes
		const resetResponse = await handle({ event: makeRLEvent(), resolve } as never);
		expect(resetResponse.status).not.toBe(429);
	});
});

describe('securityHeaders', () => {
	// Use /login path (bypasses requireAuth) so we get a full response through securityHeaders
	async function getHeadersResponse() {
		const event = makeEvent({ pathname: '/login' });
		return handle({ event, resolve } as never);
	}

	it('sets X-Frame-Options: DENY', async () => {
		const response = await getHeadersResponse();
		expect(response.headers.get('X-Frame-Options')).toBe('DENY');
	});

	it('sets X-Content-Type-Options: nosniff', async () => {
		const response = await getHeadersResponse();
		expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
	});

	it('sets a Referrer-Policy header', async () => {
		const response = await getHeadersResponse();
		expect(response.headers.get('Referrer-Policy')).toBeTruthy();
	});

	it('sets Strict-Transport-Security header', async () => {
		const response = await getHeadersResponse();
		expect(response.headers.get('Strict-Transport-Security')).toBeTruthy();
	});

	it('Content-Security-Policy contains default-src "self"', async () => {
		const response = await getHeadersResponse();
		const csp = response.headers.get('Content-Security-Policy') ?? '';
		expect(csp).toContain("default-src 'self'");
	});

	it('Content-Security-Policy contains frame-ancestors "none"', async () => {
		const response = await getHeadersResponse();
		const csp = response.headers.get('Content-Security-Policy') ?? '';
		expect(csp).toContain("frame-ancestors 'none'");
	});
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

// Use vi.hoisted so mockEnv is available in the vi.mock factory (which runs before imports)
const { mockEnv } = vi.hoisted(() => {
	const mockEnv: Record<string, string | undefined> = {};
	return { mockEnv };
});

vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

// Static import — `env` inside config.ts is bound to mockEnv by reference,
// so mutating mockEnv between calls changes what getServiceConfigs() reads.
import { getServiceConfigs } from './config.js';

const REQUIRED_VARS: Record<string, string> = {
	SUPABASE_URL: 'https://test.supabase.co',
	SUPABASE_SERVICE_KEY: 'test-service-key'
};

const OPTIONAL_SERVICE_VARS: Record<string, string[]> = {
	fly: ['FLY_API_TOKEN', 'FLY_ORG', 'FLY_APPS'],
	cloudflare: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID'],
	stripe: ['STRIPE_SECRET_KEY'],
	sentry: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT']
};

const FULL_OPTIONAL_VALS: Record<string, string> = {
	FLY_API_TOKEN: 'fly-token',
	FLY_ORG: 'my-org',
	FLY_APPS: 'app1,app2',
	CLOUDFLARE_API_TOKEN: 'cf-token',
	CLOUDFLARE_ZONE_ID: 'zone-123',
	STRIPE_SECRET_KEY: 'sk_test_123',
	SENTRY_AUTH_TOKEN: 'sentry-token',
	SENTRY_ORG: 'my-sentry-org',
	SENTRY_PROJECT: 'my-project'
};

function setEnv(vars: Record<string, string | undefined>) {
	// Clear all keys
	for (const k of Object.keys(mockEnv)) delete mockEnv[k];
	// Apply new values
	Object.assign(mockEnv, vars);
}

beforeEach(() => {
	setEnv({ ...REQUIRED_VARS, ...FULL_OPTIONAL_VALS });
});

// Feature: monitoring-real-api-integration, Property 1: Configuration Detection
describe('Property 1: Configuration Detection', () => {
	it('when all vars are present, all services report configured=true', () => {
		setEnv({ ...REQUIRED_VARS, ...FULL_OPTIONAL_VALS });
		const configs = getServiceConfigs();
		expect(configs.fly.configured).toBe(true);
		expect(configs.cloudflare.configured).toBe(true);
		expect(configs.stripe.configured).toBe(true);
		expect(configs.supabase.configured).toBe(true);
		expect(configs.sentry.configured).toBe(true);
	});

	it('fly config derives prometheusBaseUrl from FLY_ORG', () => {
		setEnv({ ...REQUIRED_VARS, ...FULL_OPTIONAL_VALS });
		const configs = getServiceConfigs();
		if (configs.fly.configured) {
			expect(configs.fly.config.prometheusBaseUrl).toBe(
				'https://api.fly.io/prometheus/my-org/api/v1'
			);
		} else {
			throw new Error('expected fly to be configured');
		}
	});

	it('missing optional service vars → configured=false with exact missingVars', () => {
		// For each optional service, generate a non-empty subset of vars to omit
		const serviceArb = fc.constantFrom(
			...(Object.keys(OPTIONAL_SERVICE_VARS) as Array<keyof typeof OPTIONAL_SERVICE_VARS>)
		);

		fc.assert(
			fc.property(
				serviceArb.chain((service) => {
					const vars = OPTIONAL_SERVICE_VARS[service];
					return fc.subarray(vars, { minLength: 1 }).map((omitted) => ({ service, omitted }));
				}),
				({ service, omitted }) => {
					const envVars: Record<string, string | undefined> = {
						...REQUIRED_VARS,
						...FULL_OPTIONAL_VALS
					};
					for (const k of omitted) delete envVars[k];
					setEnv(envVars);

					const configs = getServiceConfigs();
					const result = configs[service as keyof typeof configs];

					expect(result.configured).toBe(false);
					if (!result.configured) {
						// missingVars must contain exactly the omitted keys (order-independent)
						expect(result.missingVars.slice().sort()).toEqual(omitted.slice().sort());
					}
				}
			),
			{ numRuns: 200 }
		);
	});

	it('empty-string optional service vars are treated as missing', () => {
		// Whitespace-only or empty values should count as missing
		const serviceArb = fc.constantFrom(
			...(Object.keys(OPTIONAL_SERVICE_VARS) as Array<keyof typeof OPTIONAL_SERVICE_VARS>)
		);

		fc.assert(
			fc.property(
				serviceArb.chain((service) => {
					const vars = OPTIONAL_SERVICE_VARS[service];
					return fc.subarray(vars, { minLength: 1 }).chain((emptyKeys) =>
						fc
							.array(
								fc.oneof(
									fc.constant(''),
									fc.string({ maxLength: 5 }).map((s) => ('   ' + s.trim() === '' ? s : '   '))
								),
								{ minLength: emptyKeys.length, maxLength: emptyKeys.length }
							)
							.map((emptyVals) => ({ service, emptyKeys, emptyVals }))
					);
				}),
				({ service, emptyKeys, emptyVals }) => {
					const envVars: Record<string, string | undefined> = {
						...REQUIRED_VARS,
						...FULL_OPTIONAL_VALS
					};
					for (let i = 0; i < emptyKeys.length; i++) {
						envVars[emptyKeys[i]] = emptyVals[i] || '';
					}
					setEnv(envVars);

					const configs = getServiceConfigs();
					const result = configs[service as keyof typeof configs];

					// Any service with one or more empty/whitespace vars should be not-configured
					// (this test focuses on the empty-string case)
					expect(result.configured).toBe(false);
				}
			),
			{ numRuns: 100 }
		);
	});

	it('missing supabase vars throw at getServiceConfigs() time', () => {
		fc.assert(
			fc.property(
				fc.subarray(['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'], { minLength: 1 }),
				(omitted) => {
					const envVars: Record<string, string | undefined> = {
						...REQUIRED_VARS,
						...FULL_OPTIONAL_VALS
					};
					for (const k of omitted) delete envVars[k];
					setEnv(envVars);

					expect(() => getServiceConfigs()).toThrow();
				}
			),
			{ numRuns: 50 }
		);
	});
});

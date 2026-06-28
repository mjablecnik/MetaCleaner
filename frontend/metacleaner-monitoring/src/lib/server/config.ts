import { env } from '$env/dynamic/private';
import type { ClientConfig } from './clients/types.js';

export interface FlyClientConfig extends ClientConfig {
	org: string;
	apps: string[];
}

export interface CloudflareClientConfig extends ClientConfig {
	zoneId: string;
}

export type StripeClientConfig = ClientConfig;

export interface SupabaseClientConfig {
	url: string;
	serviceKey: string;
	timeout?: number;
}

export interface SentryClientConfig extends ClientConfig {
	org: string;
	project: string;
}

export interface ServiceConfigs {
	fly: { configured: true; config: FlyClientConfig } | { configured: false; missingVars: string[] };
	cloudflare:
		| { configured: true; config: CloudflareClientConfig }
		| { configured: false; missingVars: string[] };
	stripe:
		{ configured: true; config: StripeClientConfig } | { configured: false; missingVars: string[] };
	supabase:
		| { configured: true; config: SupabaseClientConfig }
		| { configured: false; missingVars: string[] };
	sentry:
		{ configured: true; config: SentryClientConfig } | { configured: false; missingVars: string[] };
}

function isPresent(value: string | undefined): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function missingFrom(vars: Record<string, string | undefined>): string[] {
	return Object.entries(vars)
		.filter(([, v]) => !isPresent(v))
		.map(([k]) => k);
}

export function getServiceConfigs(): ServiceConfigs {
	// Fly.io (optional)
	const flyMissing = missingFrom({
		FLY_API_TOKEN: env.FLY_API_TOKEN,
		FLY_ORG: env.FLY_ORG,
		FLY_APPS: env.FLY_APPS
	});
	const fly: ServiceConfigs['fly'] =
		flyMissing.length === 0
			? {
					configured: true,
					config: {
						token: env.FLY_API_TOKEN!,
						baseUrl: 'https://api.machines.dev/v1',
						org: env.FLY_ORG!,
						apps: env
							.FLY_APPS!.split(',')
							.map((s) => s.trim())
							.filter(Boolean),
						timeout: 10_000
					}
				}
			: { configured: false, missingVars: flyMissing };

	// Cloudflare (optional)
	const cfMissing = missingFrom({
		CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
		CLOUDFLARE_ZONE_ID: env.CLOUDFLARE_ZONE_ID
	});
	const cloudflare: ServiceConfigs['cloudflare'] =
		cfMissing.length === 0
			? {
					configured: true,
					config: {
						token: env.CLOUDFLARE_API_TOKEN!,
						baseUrl: 'https://api.cloudflare.com/client/v4',
						zoneId: env.CLOUDFLARE_ZONE_ID!,
						timeout: 10_000
					}
				}
			: { configured: false, missingVars: cfMissing };

	// Stripe (optional)
	const stripeMissing = missingFrom({ STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY });
	const stripe: ServiceConfigs['stripe'] =
		stripeMissing.length === 0
			? {
					configured: true,
					config: {
						token: env.STRIPE_SECRET_KEY!,
						baseUrl: 'https://api.stripe.com/v1',
						timeout: 10_000
					}
				}
			: { configured: false, missingVars: stripeMissing };

	// Supabase (required — assert at startup)
	const supaMissing = missingFrom({
		SUPABASE_URL: env.SUPABASE_URL,
		SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY
	});
	if (supaMissing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${supaMissing.join(', ')}. The dashboard cannot start without Supabase configuration.`
		);
	}
	const supabase: ServiceConfigs['supabase'] = {
		configured: true,
		config: {
			url: env.SUPABASE_URL!,
			serviceKey: env.SUPABASE_SERVICE_KEY!,
			timeout: 10_000
		}
	};

	// Sentry (optional)
	const sentryMissing = missingFrom({
		SENTRY_AUTH_TOKEN: env.SENTRY_AUTH_TOKEN,
		SENTRY_ORG: env.SENTRY_ORG,
		SENTRY_PROJECT: env.SENTRY_PROJECT
	});
	const sentry: ServiceConfigs['sentry'] =
		sentryMissing.length === 0
			? {
					configured: true,
					config: {
						token: env.SENTRY_AUTH_TOKEN!,
						baseUrl: 'https://sentry.io/api/0',
						org: env.SENTRY_ORG!,
						project: env.SENTRY_PROJECT!,
						timeout: 10_000
					}
				}
			: { configured: false, missingVars: sentryMissing };

	return { fly, cloudflare, stripe, supabase, sentry };
}

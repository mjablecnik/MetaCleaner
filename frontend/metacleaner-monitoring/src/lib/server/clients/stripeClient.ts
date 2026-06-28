import type { StripeClientConfig } from '../config.js';
import { ClientError, categorizeStatus, fetchWithTimeout } from './types.js';

export interface StripeSubscriptionRaw {
	id: string;
	status: string;
	items: {
		data: Array<{
			price: {
				id: string;
				unit_amount: number;
				recurring: { interval: string; interval_count: number };
			};
			quantity: number;
		}>;
	};
	created: number;
	canceled_at: number | null;
	current_period_start: number;
}

export interface StripePriceRaw {
	id: string;
	product: string;
	unit_amount: number;
	nickname: string | null;
}

interface StripeListResponse<T> {
	object: 'list';
	data: T[];
	has_more: boolean;
	url: string;
}

function basicAuthHeader(token: string): string {
	return `Basic ${btoa(`${token}:`)}`;
}

async function stripeGet<T>(
	config: StripeClientConfig,
	path: string,
	params?: Record<string, string>
): Promise<T> {
	const base = config.baseUrl ?? 'https://api.stripe.com/v1';
	const url = new URL(`${base}${path}`);
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			url.searchParams.set(k, v);
		}
	}

	let response: Response;
	try {
		response = await fetchWithTimeout(
			url.toString(),
			{
				headers: {
					Authorization: basicAuthHeader(config.token),
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			},
			config.timeout ?? 10_000
		);
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new ClientError('stripe', null, 'timeout', 'Stripe request timed out');
		}
		throw new ClientError('stripe', null, 'request_error', `Stripe network error: ${String(err)}`);
	}

	if (!response.ok) {
		throw new ClientError(
			'stripe',
			response.status,
			categorizeStatus(response.status),
			`Stripe API returned ${response.status}`
		);
	}

	return response.json() as Promise<T>;
}

async function listAll<T>(
	config: StripeClientConfig,
	path: string,
	params?: Record<string, string>
): Promise<T[]> {
	const results: T[] = [];
	let startingAfter: string | undefined;
	let hasMore = true;

	while (hasMore) {
		const pageParams: Record<string, string> = { limit: '100', ...params };
		if (startingAfter) {
			pageParams.starting_after = startingAfter;
		}

		const page = await stripeGet<StripeListResponse<T & { id: string }>>(config, path, pageParams);

		results.push(...page.data);

		if (page.has_more && page.data.length > 0) {
			startingAfter = page.data[page.data.length - 1].id;
		} else {
			hasMore = false;
		}
	}

	return results;
}

export async function getActiveSubscriptions(
	config: StripeClientConfig
): Promise<StripeSubscriptionRaw[]> {
	if (!config.token?.trim()) {
		throw new ClientError('stripe', null, 'unauthorized', 'STRIPE_SECRET_KEY is missing or empty');
	}

	return listAll<StripeSubscriptionRaw>(config, '/subscriptions', { status: 'active' });
}

export async function getCanceledSubscriptions(
	config: StripeClientConfig,
	since: number
): Promise<StripeSubscriptionRaw[]> {
	if (!config.token?.trim()) {
		throw new ClientError('stripe', null, 'unauthorized', 'STRIPE_SECRET_KEY is missing or empty');
	}

	return listAll<StripeSubscriptionRaw>(config, '/subscriptions', {
		status: 'canceled',
		'canceled_at[gte]': String(since)
	});
}

export async function getPrices(config: StripeClientConfig): Promise<StripePriceRaw[]> {
	if (!config.token?.trim()) {
		throw new ClientError('stripe', null, 'unauthorized', 'STRIPE_SECRET_KEY is missing or empty');
	}

	return listAll<StripePriceRaw>(config, '/prices', { active: 'true' });
}

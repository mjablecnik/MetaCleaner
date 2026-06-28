import type { SentryClientConfig } from '../config.js';
import { ClientError, categorizeStatus, fetchWithTimeout } from './types.js';

export interface SentryIssueRaw {
	id: string;
	title: string;
	culprit: string;
	status: string;
	level: string;
	lastSeen: string;
	firstSeen: string;
	count: string;
	userCount: number;
	metadata: {
		type?: string;
		value?: string;
		filename?: string;
	};
	type: string;
	tags?: Array<{ key: string; value: string }>;
}

export interface SentryIssueStatsRaw {
	id: string;
	stats: {
		'24h': Array<[number, number]>;
	};
}

async function sentryGet<T>(
	config: SentryClientConfig,
	path: string,
	params?: Record<string, string>
): Promise<T> {
	if (!config.token?.trim()) {
		throw new ClientError('sentry', null, 'unauthorized', 'SENTRY_AUTH_TOKEN is missing or empty');
	}

	const base = config.baseUrl ?? 'https://sentry.io/api/0';
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
					Authorization: `Bearer ${config.token}`,
					'Content-Type': 'application/json'
				}
			},
			config.timeout ?? 10_000
		);
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new ClientError('sentry', null, 'timeout', 'Sentry request timed out');
		}
		throw new ClientError('sentry', null, 'request_error', `Sentry network error: ${String(err)}`);
	}

	if (!response.ok) {
		throw new ClientError(
			'sentry',
			response.status,
			categorizeStatus(response.status),
			`Sentry API returned ${response.status}`
		);
	}

	return response.json() as Promise<T>;
}

export async function getRecentIssues(
	config: SentryClientConfig,
	limit: number = 25
): Promise<SentryIssueRaw[]> {
	if (!config.token?.trim()) {
		throw new ClientError('sentry', null, 'unauthorized', 'SENTRY_AUTH_TOKEN is missing or empty');
	}
	if (!config.org?.trim()) {
		throw new ClientError('sentry', null, 'request_error', 'SENTRY_ORG is missing or empty');
	}
	if (!config.project?.trim()) {
		throw new ClientError('sentry', null, 'request_error', 'SENTRY_PROJECT is missing or empty');
	}

	const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

	return sentryGet<SentryIssueRaw[]>(config, `/projects/${config.org}/${config.project}/issues/`, {
		limit: String(limit),
		query: `lastSeen:>${since}`,
		sort: 'date'
	});
}

export async function getIssueStats(config: SentryClientConfig): Promise<SentryIssueStatsRaw[]> {
	if (!config.token?.trim()) {
		throw new ClientError('sentry', null, 'unauthorized', 'SENTRY_AUTH_TOKEN is missing or empty');
	}
	if (!config.org?.trim()) {
		throw new ClientError('sentry', null, 'request_error', 'SENTRY_ORG is missing or empty');
	}
	if (!config.project?.trim()) {
		throw new ClientError('sentry', null, 'request_error', 'SENTRY_PROJECT is missing or empty');
	}

	const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

	return sentryGet<SentryIssueStatsRaw[]>(
		config,
		`/projects/${config.org}/${config.project}/issues/`,
		{
			limit: '100',
			query: `lastSeen:>${since}`,
			sort: 'date',
			statsPeriod: '24h'
		}
	);
}

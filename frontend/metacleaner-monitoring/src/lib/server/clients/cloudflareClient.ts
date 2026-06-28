import type { CloudflareClientConfig } from '../config.js';
import { ClientError, categorizeStatus, fetchWithTimeout } from './types.js';

export interface CfAnalyticsRaw {
	httpRequests1dGroups: Array<{
		sum: {
			requests: number;
			cachedRequests: number;
			bytes: number;
			cachedBytes: number;
			threats: number;
		};
		dimensions: { date: string };
	}>;
}

export interface CfGeoRaw {
	clientCountryMap: Array<{ clientCountryName: string; requests: number }>;
}

export interface CfFirewallEventRaw {
	action: string;
	clientIP: string;
	clientCountry: string;
	datetime: string;
	ruleId: string;
	source: string;
	userAgent: string;
}

function graphqlEndpoint(config: CloudflareClientConfig): string {
	const base = config.baseUrl ?? 'https://api.cloudflare.com/client/v4';
	return `${base}/graphql`;
}

async function executeGraphQL<T>(
	config: CloudflareClientConfig,
	query: string,
	variables: Record<string, unknown>
): Promise<T> {
	const url = graphqlEndpoint(config);

	let response: Response;
	try {
		response = await fetchWithTimeout(
			url,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${config.token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ query, variables })
			},
			config.timeout ?? 10_000
		);
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new ClientError('cloudflare', null, 'timeout', 'Cloudflare request timed out');
		}
		throw new ClientError(
			'cloudflare',
			null,
			'request_error',
			`Cloudflare network error: ${String(err)}`
		);
	}

	if (!response.ok) {
		throw new ClientError(
			'cloudflare',
			response.status,
			categorizeStatus(response.status),
			`Cloudflare API returned ${response.status}`
		);
	}

	const json = (await response.json()) as {
		data?: T;
		errors?: Array<{ message: string }>;
	};

	if (json.errors?.length) {
		throw new ClientError(
			'cloudflare',
			null,
			'request_error',
			`Cloudflare GraphQL error: ${json.errors[0].message}`
		);
	}

	return json.data as T;
}

export async function getAnalytics(config: CloudflareClientConfig): Promise<CfAnalyticsRaw> {
	if (!config.token?.trim()) {
		throw new ClientError(
			'cloudflare',
			null,
			'unauthorized',
			'CLOUDFLARE_API_TOKEN is missing or empty'
		);
	}
	if (!config.zoneId?.trim()) {
		throw new ClientError(
			'cloudflare',
			null,
			'request_error',
			'CLOUDFLARE_ZONE_ID is missing or empty'
		);
	}

	const now = new Date();
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const since = yesterday.toISOString().slice(0, 10);
	const until = now.toISOString().slice(0, 10);

	const query = `
    query GetZoneAnalytics($zoneId: String!, $since: String!, $until: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          httpRequests1dGroups(
            filter: { date_geq: $since, date_leq: $until }
            orderBy: [date_ASC]
            limit: 2
          ) {
            sum {
              requests
              cachedRequests
              bytes
              cachedBytes
              threats
            }
            dimensions {
              date
            }
          }
        }
      }
    }
  `;

	type GqlResult = {
		viewer: {
			zones: Array<{
				httpRequests1dGroups: CfAnalyticsRaw['httpRequests1dGroups'];
			}>;
		};
	};

	const data = await executeGraphQL<GqlResult>(config, query, {
		zoneId: config.zoneId,
		since,
		until
	});

	const zone = data.viewer.zones[0];
	return { httpRequests1dGroups: zone?.httpRequests1dGroups ?? [] };
}

export async function getGeoDistribution(config: CloudflareClientConfig): Promise<CfGeoRaw> {
	if (!config.token?.trim()) {
		throw new ClientError(
			'cloudflare',
			null,
			'unauthorized',
			'CLOUDFLARE_API_TOKEN is missing or empty'
		);
	}
	if (!config.zoneId?.trim()) {
		throw new ClientError(
			'cloudflare',
			null,
			'request_error',
			'CLOUDFLARE_ZONE_ID is missing or empty'
		);
	}

	const now = new Date();
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const since = yesterday.toISOString().slice(0, 10);
	const until = now.toISOString().slice(0, 10);

	const query = `
    query GetGeoDistribution($zoneId: String!, $since: String!, $until: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          httpRequests1dGroups(
            filter: { date_geq: $since, date_leq: $until }
            orderBy: [date_ASC]
            limit: 1
          ) {
            sum {
              countryMap {
                clientCountryName
                requests
              }
            }
          }
        }
      }
    }
  `;

	type GqlResult = {
		viewer: {
			zones: Array<{
				httpRequests1dGroups: Array<{
					sum: {
						countryMap: Array<{ clientCountryName: string; requests: number }>;
					};
				}>;
			}>;
		};
	};

	const data = await executeGraphQL<GqlResult>(config, query, {
		zoneId: config.zoneId,
		since,
		until
	});

	const zone = data.viewer.zones[0];
	const groups = zone?.httpRequests1dGroups ?? [];
	const countryMap = groups[0]?.sum?.countryMap ?? [];

	return { clientCountryMap: countryMap };
}

export async function getFirewallEvents(
	config: CloudflareClientConfig,
	limit: number = 20
): Promise<CfFirewallEventRaw[]> {
	if (!config.token?.trim()) {
		throw new ClientError(
			'cloudflare',
			null,
			'unauthorized',
			'CLOUDFLARE_API_TOKEN is missing or empty'
		);
	}
	if (!config.zoneId?.trim()) {
		throw new ClientError(
			'cloudflare',
			null,
			'request_error',
			'CLOUDFLARE_ZONE_ID is missing or empty'
		);
	}

	const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

	const query = `
    query GetFirewallEvents($zoneId: String!, $since: Time!, $limit: Int!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          firewallEventsAdaptive(
            filter: { datetime_geq: $since }
            limit: $limit
            orderBy: [datetime_DESC]
          ) {
            action
            clientIP
            clientCountryName
            datetime
            ruleId
            source
            userAgent
          }
        }
      }
    }
  `;

	type GqlEvent = {
		action: string;
		clientIP: string;
		clientCountryName: string;
		datetime: string;
		ruleId: string;
		source: string;
		userAgent: string;
	};

	type GqlResult = {
		viewer: {
			zones: Array<{
				firewallEventsAdaptive: GqlEvent[];
			}>;
		};
	};

	const data = await executeGraphQL<GqlResult>(config, query, {
		zoneId: config.zoneId,
		since,
		limit
	});

	const zone = data.viewer.zones[0];
	const events = zone?.firewallEventsAdaptive ?? [];

	return events.map((e) => ({
		action: e.action,
		clientIP: e.clientIP,
		clientCountry: e.clientCountryName,
		datetime: e.datetime,
		ruleId: e.ruleId,
		source: e.source,
		userAgent: e.userAgent
	}));
}

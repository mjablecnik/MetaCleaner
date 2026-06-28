import type { SupabaseClientConfig } from '../config.js';
import { ClientError, categorizeStatus, fetchWithTimeout } from './types.js';

export interface SupabaseTableStatsRaw {
	table_name: string;
	row_count: number;
	total_bytes: number;
}

export interface SupabaseUserRaw {
	id: string;
	email: string;
	created_at: string;
	last_sign_in_at: string | null;
	app_metadata: { provider?: string; providers?: string[] };
}

function supabaseHeaders(serviceKey: string): Record<string, string> {
	return {
		Authorization: `Bearer ${serviceKey}`,
		apikey: serviceKey,
		'Content-Type': 'application/json'
	};
}

async function supabaseRequest<T>(
	config: SupabaseClientConfig,
	path: string,
	params?: Record<string, string>
): Promise<T> {
	const url = new URL(`${config.url}${path}`);
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			url.searchParams.set(k, v);
		}
	}

	let response: Response;
	try {
		response = await fetchWithTimeout(
			url.toString(),
			{ headers: supabaseHeaders(config.serviceKey) },
			config.timeout ?? 10_000
		);
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new ClientError('supabase', null, 'timeout', 'Supabase request timed out');
		}
		throw new ClientError(
			'supabase',
			null,
			'request_error',
			`Supabase network error: ${String(err)}`
		);
	}

	if (!response.ok) {
		throw new ClientError(
			'supabase',
			response.status,
			categorizeStatus(response.status),
			`Supabase API returned ${response.status}`
		);
	}

	return response.json() as Promise<T>;
}

export async function getTableStats(
	config: SupabaseClientConfig
): Promise<SupabaseTableStatsRaw[]> {
	if (!config.serviceKey?.trim()) {
		throw new ClientError(
			'supabase',
			null,
			'unauthorized',
			'SUPABASE_SERVICE_KEY is missing or empty'
		);
	}
	if (!config.url?.trim()) {
		throw new ClientError('supabase', null, 'request_error', 'SUPABASE_URL is missing or empty');
	}

	return supabaseRequest<SupabaseTableStatsRaw[]>(config, '/rest/v1/rpc/get_table_stats');
}

export async function getUsers(
	config: SupabaseClientConfig,
	page: number = 1,
	perPage: number = 50
): Promise<{ users: SupabaseUserRaw[]; total: number }> {
	if (!config.serviceKey?.trim()) {
		throw new ClientError(
			'supabase',
			null,
			'unauthorized',
			'SUPABASE_SERVICE_KEY is missing or empty'
		);
	}
	if (!config.url?.trim()) {
		throw new ClientError('supabase', null, 'request_error', 'SUPABASE_URL is missing or empty');
	}

	const url = new URL(`${config.url}/auth/v1/admin/users`);
	url.searchParams.set('page', String(page));
	url.searchParams.set('per_page', String(perPage));

	let response: Response;
	try {
		response = await fetchWithTimeout(
			url.toString(),
			{ headers: supabaseHeaders(config.serviceKey) },
			config.timeout ?? 10_000
		);
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			throw new ClientError('supabase', null, 'timeout', 'Supabase request timed out');
		}
		throw new ClientError(
			'supabase',
			null,
			'request_error',
			`Supabase network error: ${String(err)}`
		);
	}

	if (!response.ok) {
		throw new ClientError(
			'supabase',
			response.status,
			categorizeStatus(response.status),
			`Supabase API returned ${response.status}`
		);
	}

	const data = (await response.json()) as { users: SupabaseUserRaw[]; total: number };
	return { users: data.users ?? [], total: data.total ?? 0 };
}

export async function queryTable<T>(
	config: SupabaseClientConfig,
	table: string,
	params?: Record<string, string>
): Promise<T[]> {
	if (!config.serviceKey?.trim()) {
		throw new ClientError(
			'supabase',
			null,
			'unauthorized',
			'SUPABASE_SERVICE_KEY is missing or empty'
		);
	}
	if (!config.url?.trim()) {
		throw new ClientError('supabase', null, 'request_error', 'SUPABASE_URL is missing or empty');
	}

	return supabaseRequest<T[]>(config, `/rest/v1/${table}`, params);
}

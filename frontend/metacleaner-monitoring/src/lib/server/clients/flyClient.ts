import type { FlyClientConfig } from '../config.js';
import { ClientError, categorizeStatus, fetchWithTimeout } from './types.js';

export interface FlyMachineRaw {
	id: string;
	name: string;
	state: string;
	region: string;
	config: { guest: { cpus: number; memory_mb: number } };
	checks?: Array<{ status: string; name: string }>;
	created_at: string;
	updated_at: string;
	events?: Array<{ type: string; timestamp: number; status: string }>;
}

export async function getMachines(config: FlyClientConfig, app: string): Promise<FlyMachineRaw[]> {
	if (!config.token || !config.token.trim()) {
		throw new ClientError('fly', null, 'unauthorized', 'FLY_API_TOKEN is missing or empty');
	}

	const baseUrl = config.baseUrl ?? 'https://api.machines.dev/v1';
	const url = `${baseUrl}/apps/${app}/machines`;

	let response: Response;
	try {
		response = await fetchWithTimeout(
			url,
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
			throw new ClientError('fly', null, 'timeout', `Fly.io request timed out for app ${app}`);
		}
		throw new ClientError(
			'fly',
			null,
			'request_error',
			`Fly.io network error for app ${app}: ${String(err)}`
		);
	}

	if (!response.ok) {
		throw new ClientError(
			'fly',
			response.status,
			categorizeStatus(response.status),
			`Fly.io API returned ${response.status} for app ${app}`
		);
	}

	return response.json() as Promise<FlyMachineRaw[]>;
}

export async function getMachinesForAllApps(
	config: FlyClientConfig
): Promise<Map<string, FlyMachineRaw[]>> {
	const result = new Map<string, FlyMachineRaw[]>();

	await Promise.all(
		config.apps.map(async (app) => {
			const machines = await getMachines(config, app);
			result.set(app, machines);
		})
	);

	return result;
}

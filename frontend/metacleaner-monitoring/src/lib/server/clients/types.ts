export interface ClientConfig {
	token: string;
	baseUrl?: string;
	timeout?: number; // default 10_000ms
}

export class ClientError extends Error {
	constructor(
		public readonly service: string,
		public readonly statusCode: number | null,
		public readonly category: 'timeout' | 'unauthorized' | 'service_unavailable' | 'request_error',
		message: string
	) {
		super(message);
		this.name = 'ClientError';
	}
}

export type SectionResult<T> =
	| { status: 'ok'; data: T }
	| { status: 'not-configured'; missingVars: string[] }
	| { status: 'error'; error: { category: ClientError['category']; message: string } };

export function categorizeStatus(statusCode: number): ClientError['category'] {
	if (statusCode === 401 || statusCode === 403) return 'unauthorized';
	if (statusCode >= 500) return 'service_unavailable';
	return 'request_error';
}

export async function fetchWithTimeout(
	url: string,
	init: RequestInit,
	timeoutMs: number = 10_000
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, { ...init, signal: controller.signal });
		return response;
	} finally {
		clearTimeout(timeoutId);
	}
}

export async function callSection<T>(fn: () => Promise<T>): Promise<SectionResult<T>> {
	try {
		const data = await fn();
		return { status: 'ok', data };
	} catch (e) {
		if (e instanceof ClientError) {
			console.error(`[${e.service}] upstream failure (${e.category}):`, e.message);
			return { status: 'error', error: { category: e.category, message: '' } };
		}
		const detail = e instanceof Error ? e.message : String(e);
		console.error('[section] upstream failure:', detail);
		return { status: 'error', error: { category: 'request_error', message: '' } };
	}
}

export function notConfigured(missingVars: string[]): SectionResult<never> {
	return { status: 'not-configured', missingVars };
}

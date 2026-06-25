import { buildApiUrl } from './api-config.js';
import { authStore } from '$lib/auth/auth.svelte.js';

export interface ApiKey {
	id: string;
	name: string;
	key_prefix: string;
	key_suffix: string;
	status: 'active' | 'revoked';
	note?: string;
	created_at: string;
	last_used_at: string | null;
	revoked_at: string | null;
}

export interface CreateKeyRequest {
	name: string;
	note?: string;
}

export interface CreateKeyResponse {
	key: string;
	api_key: ApiKey;
}

export class ApiKeyError extends Error {
	constructor(
		public readonly code: string,
		public readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiKeyError';
	}
}

async function parseErrorResponse(res: Response): Promise<ApiKeyError> {
	const body = await res.json().catch(() => ({ error: res.statusText, message: res.statusText }));
	const code = (body as { error?: string }).error ?? 'UNKNOWN_ERROR';
	const message = (body as { message?: string }).message ?? res.statusText;
	return new ApiKeyError(code, res.status, message);
}

export async function createApiKey(req: CreateKeyRequest): Promise<CreateKeyResponse> {
	const res = await fetch(buildApiUrl('/api/keys'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authStore.accessToken}`
		},
		body: JSON.stringify(req)
	});
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json() as Promise<CreateKeyResponse>;
}

export async function listApiKeys(): Promise<ApiKey[]> {
	const res = await fetch(buildApiUrl('/api/keys'), {
		headers: { Authorization: `Bearer ${authStore.accessToken}` }
	});
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json() as Promise<ApiKey[]>;
}

export async function deleteApiKey(id: string): Promise<void> {
	const res = await fetch(buildApiUrl(`/api/keys/${id}`), {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${authStore.accessToken}` }
	});
	if (!res.ok) throw await parseErrorResponse(res);
}

export async function revokeApiKey(id: string): Promise<ApiKey> {
	const res = await fetch(buildApiUrl(`/api/keys/${id}/revoke`), {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${authStore.accessToken}` }
	});
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json() as Promise<ApiKey>;
}

export async function activateApiKey(id: string): Promise<ApiKey> {
	const res = await fetch(buildApiUrl(`/api/keys/${id}/activate`), {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${authStore.accessToken}` }
	});
	if (!res.ok) throw await parseErrorResponse(res);
	return res.json() as Promise<ApiKey>;
}

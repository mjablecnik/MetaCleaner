import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ──────────────────────────────────────────────────────────

const { mockFetch, mockBuildApiUrl, mockAuthStore } = vi.hoisted(() => ({
	mockFetch: vi.fn<() => Promise<Response>>(),
	mockBuildApiUrl: vi.fn<(path: string) => string>((path) => `http://localhost:8080${path}`),
	mockAuthStore: { accessToken: 'test-token' as string | null }
}));

vi.mock('$lib/clients/api-config.js', () => ({
	buildApiUrl: mockBuildApiUrl
}));

vi.mock('$lib/auth/auth.svelte.js', () => ({
	authStore: mockAuthStore
}));

vi.stubGlobal('fetch', mockFetch);

import { createApiKey, listApiKeys, deleteApiKey, revokeApiKey, ApiKeyError } from '../apiKeysClient.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeResponse(
	ok: boolean,
	status: number,
	body: unknown,
	statusText = 'Error'
): Response {
	return {
		ok,
		status,
		statusText,
		json: vi.fn().mockResolvedValue(body),
		text: vi.fn().mockResolvedValue(String(body))
	} as unknown as Response;
}

function makeResponseJsonFails(status: number, statusText: string): Response {
	return {
		ok: false,
		status,
		statusText,
		json: vi.fn().mockRejectedValue(new Error('not json')),
		text: vi.fn().mockResolvedValue(statusText)
	} as unknown as Response;
}

const MOCK_KEY = {
	id: 'key-1',
	name: 'Test Key',
	key_prefix: 'mc_',
	key_suffix: 'abcd',
	status: 'active' as const,
	created_at: '2026-01-01T00:00:00Z',
	last_used_at: null,
	revoked_at: null
};

beforeEach(() => {
	mockFetch.mockReset();
	mockAuthStore.accessToken = 'test-token';
	mockBuildApiUrl.mockImplementation((path: string) => `http://localhost:8080${path}`);
});

// ─── ApiKeyError class ───────────────────────────────────────────────────────

describe('ApiKeyError', () => {
	it('has name ApiKeyError', () => {
		const err = new ApiKeyError('SOME_CODE', 400, 'message');
		expect(err.name).toBe('ApiKeyError');
	});

	it('exposes code and status', () => {
		const err = new ApiKeyError('MY_CODE', 422, 'msg');
		expect(err.code).toBe('MY_CODE');
		expect(err.status).toBe(422);
	});

	it('is an instance of Error', () => {
		const err = new ApiKeyError('X', 500, 'msg');
		expect(err).toBeInstanceOf(Error);
	});
});

// ─── createApiKey ────────────────────────────────────────────────────────────

describe('createApiKey', () => {
	it('sends POST to /api/keys with Authorization header and JSON body', async () => {
		const response = { key: 'mc_full_key', api_key: MOCK_KEY };
		mockFetch.mockResolvedValue(makeResponse(true, 201, response));

		await createApiKey({ name: 'Test Key', note: 'for testing' });

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/keys',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
					Authorization: 'Bearer test-token'
				}),
				body: JSON.stringify({ name: 'Test Key', note: 'for testing' })
			})
		);
	});

	it('returns CreateKeyResponse on success', async () => {
		const response = { key: 'mc_full_key', api_key: MOCK_KEY };
		mockFetch.mockResolvedValue(makeResponse(true, 201, response));

		const result = await createApiKey({ name: 'Test Key' });
		expect(result).toEqual(response);
	});

	it('includes Authorization header with current accessToken', async () => {
		mockAuthStore.accessToken = 'custom-bearer';
		mockFetch.mockResolvedValue(makeResponse(true, 201, { key: 'k', api_key: MOCK_KEY }));

		await createApiKey({ name: 'Key' });

		const [[, init]] = mockFetch.mock.calls as [[string, RequestInit]];
		expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer custom-bearer');
	});

	it('throws ApiKeyError on non-ok response', async () => {
		mockFetch.mockResolvedValue(
			makeResponse(false, 422, { error: 'VALIDATION_ERROR', message: 'Name required' })
		);

		await expect(createApiKey({ name: '' })).rejects.toMatchObject({
			name: 'ApiKeyError',
			code: 'VALIDATION_ERROR',
			status: 422
		});
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(500, 'Server Error'));

		await expect(createApiKey({ name: 'x' })).rejects.toMatchObject({
			name: 'ApiKeyError',
			status: 500,
			message: 'Server Error'
		});
	});
});

// ─── listApiKeys ─────────────────────────────────────────────────────────────

describe('listApiKeys', () => {
	it('sends GET to /api/keys with Authorization header', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, [MOCK_KEY]));

		await listApiKeys();

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/keys',
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer test-token' })
			})
		);
	});

	it('returns array of ApiKey on success', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, [MOCK_KEY]));

		const result = await listApiKeys();
		expect(result).toEqual([MOCK_KEY]);
	});

	it('throws ApiKeyError on non-ok response', async () => {
		mockFetch.mockResolvedValue(
			makeResponse(false, 401, { error: 'UNAUTHORIZED', message: 'Unauthorized' })
		);

		await expect(listApiKeys()).rejects.toMatchObject({
			name: 'ApiKeyError',
			code: 'UNAUTHORIZED',
			status: 401
		});
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(403, 'Forbidden'));

		await expect(listApiKeys()).rejects.toMatchObject({
			name: 'ApiKeyError',
			status: 403,
			message: 'Forbidden'
		});
	});
});

// ─── deleteApiKey ─────────────────────────────────────────────────────────────

describe('deleteApiKey', () => {
	it('sends DELETE to /api/keys/{id} with Authorization header', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, {}));

		await deleteApiKey('key-1');

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/keys/key-1',
			expect.objectContaining({
				method: 'DELETE',
				headers: expect.objectContaining({ Authorization: 'Bearer test-token' })
			})
		);
	});

	it('resolves void on success', async () => {
		mockFetch.mockResolvedValue(makeResponse(true, 200, {}));
		await expect(deleteApiKey('key-1')).resolves.toBeUndefined();
	});

	it('throws ApiKeyError on non-ok response', async () => {
		mockFetch.mockResolvedValue(
			makeResponse(false, 404, { error: 'NOT_FOUND', message: 'Key not found' })
		);

		await expect(deleteApiKey('bad-id')).rejects.toMatchObject({
			name: 'ApiKeyError',
			code: 'NOT_FOUND',
			status: 404
		});
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(500, 'Internal Server Error'));

		await expect(deleteApiKey('key-1')).rejects.toMatchObject({
			name: 'ApiKeyError',
			status: 500,
			message: 'Internal Server Error'
		});
	});
});

// ─── revokeApiKey ─────────────────────────────────────────────────────────────

describe('revokeApiKey', () => {
	it('sends PATCH to /api/keys/{id}/revoke with Authorization header', async () => {
		const revokedKey = { ...MOCK_KEY, status: 'revoked' as const };
		mockFetch.mockResolvedValue(makeResponse(true, 200, revokedKey));

		await revokeApiKey('key-1');

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/keys/key-1/revoke',
			expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({ Authorization: 'Bearer test-token' })
			})
		);
	});

	it('returns updated ApiKey on success', async () => {
		const revokedKey = { ...MOCK_KEY, status: 'revoked' as const, revoked_at: '2026-01-02T00:00:00Z' };
		mockFetch.mockResolvedValue(makeResponse(true, 200, revokedKey));

		const result = await revokeApiKey('key-1');
		expect(result).toEqual(revokedKey);
	});

	it('throws ApiKeyError on non-ok response', async () => {
		mockFetch.mockResolvedValue(
			makeResponse(false, 409, { error: 'ALREADY_REVOKED', message: 'Already revoked' })
		);

		await expect(revokeApiKey('key-1')).rejects.toMatchObject({
			name: 'ApiKeyError',
			code: 'ALREADY_REVOKED',
			status: 409
		});
	});

	it('falls back to statusText when json() rejects on error', async () => {
		mockFetch.mockResolvedValue(makeResponseJsonFails(500, 'Server Error'));

		await expect(revokeApiKey('key-1')).rejects.toMatchObject({
			name: 'ApiKeyError',
			status: 500,
			message: 'Server Error'
		});
	});
});

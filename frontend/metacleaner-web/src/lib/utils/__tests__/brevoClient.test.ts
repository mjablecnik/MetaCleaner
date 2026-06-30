import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// brevoClient reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at module load time as top-level
// consts. To exercise different config branches, we use vi.resetModules() in beforeEach so each
// test gets a fresh module load with the env vars stubbed for that specific test.

const TEST_URL = 'https://test.supabase.co';
const TEST_ANON_KEY = 'test-anon-key';

const validPayload = {
	senderName: 'Alice',
	senderEmail: 'alice@example.com',
	subject: 'Test subject',
	message: 'Test message body'
};

function makeResponse(opts: { ok: boolean; status?: number; json?: () => Promise<unknown> }) {
	return {
		ok: opts.ok,
		status: opts.status ?? (opts.ok ? 200 : 400),
		json: opts.json ?? (() => Promise.resolve({}))
	};
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	vi.resetModules();
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

async function importSendContactEmail() {
	const mod = await import('../brevoClient.ts');
	return mod.sendContactEmail;
}

describe('sendContactEmail', () => {
	describe('missing configuration', () => {
		it('returns Service not configured and does not call fetch when VITE_SUPABASE_URL is missing', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', '');
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'Service not configured' });
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it('returns Service not configured and does not call fetch when VITE_SUPABASE_ANON_KEY is missing', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'Service not configured' });
			expect(fetchMock).not.toHaveBeenCalled();
		});
	});

	describe('happy path', () => {
		it('returns success:true and calls fetch with correct URL, method, headers, and body', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			fetchMock.mockResolvedValueOnce(makeResponse({ ok: true }));
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: true });

			expect(fetchMock).toHaveBeenCalledOnce();
			const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
			expect(url).toBe(`${TEST_URL}/functions/v1/send-contact-email`);
			expect(options.method).toBe('POST');
			expect((options.headers as Record<string, string>)['Authorization']).toBe(
				`Bearer ${TEST_ANON_KEY}`
			);
			expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
			const body = JSON.parse(options.body as string);
			expect(body).toMatchObject({
				senderName: validPayload.senderName,
				senderEmail: validPayload.senderEmail,
				subject: validPayload.subject,
				message: validPayload.message
			});
		});
	});

	describe('HTTP error branches', () => {
		it('returns rate_limit error on HTTP 429', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			fetchMock.mockResolvedValueOnce(
				makeResponse({ ok: false, status: 429, json: () => Promise.resolve({ error: 'Too many requests' }) })
			);
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'rate_limit' });
		});

		it('returns error from response body when non-ok with {error} JSON', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			fetchMock.mockResolvedValueOnce(
				makeResponse({ ok: false, status: 400, json: () => Promise.resolve({ error: 'Invalid request' }) })
			);
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'Invalid request' });
		});

		it('returns Failed to send when non-ok response body has no error key', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			fetchMock.mockResolvedValueOnce(
				makeResponse({ ok: false, status: 500, json: () => Promise.resolve({ message: 'oops' }) })
			);
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'Failed to send' });
		});

		it('returns Unknown error when non-ok and response.json() rejects', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			fetchMock.mockResolvedValueOnce(
				makeResponse({ ok: false, status: 503, json: () => Promise.reject(new Error('parse error')) })
			);
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'Unknown error' });
		});
	});

	describe('fetch throws', () => {
		it('returns the error message when fetch throws an Error instance', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			fetchMock.mockRejectedValueOnce(new Error('network timeout'));
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'network timeout' });
		});

		it('returns Network error when fetch throws a non-Error value', async () => {
			vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
			vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_ANON_KEY);
			fetchMock.mockRejectedValueOnce('connection refused');
			const sendContactEmail = await importSendContactEmail();

			const result = await sendContactEmail(validPayload);

			expect(result).toEqual({ success: false, error: 'Network error' });
		});
	});
});

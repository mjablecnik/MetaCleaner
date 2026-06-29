import { describe, it, expect, vi, beforeEach } from 'vitest';

// Note: each test must call vi.resetModules() and vi.doMock BEFORE importing
// api-config, because PUBLIC_API_URL is a module-level constant.

describe('buildApiUrl', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('concatenates base URL and path', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080' }));
		const { buildApiUrl } = await import('../api-config.js');

		expect(buildApiUrl('/api/keys')).toBe('http://localhost:8080/api/keys');
	});

	it('trims trailing slash from base URL before concatenating', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080/' }));
		const { buildApiUrl } = await import('../api-config.js');

		expect(buildApiUrl('/api/keys')).toBe('http://localhost:8080/api/keys');
	});

	it('trims multiple trailing slashes from base URL', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080///' }));
		const { buildApiUrl } = await import('../api-config.js');

		expect(buildApiUrl('/api/health')).toBe('http://localhost:8080/api/health');
	});

	it('works with an https base URL', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'https://api.metacleaner.com' }));
		const { buildApiUrl } = await import('../api-config.js');

		expect(buildApiUrl('/api/billing/subscription')).toBe(
			'https://api.metacleaner.com/api/billing/subscription'
		);
	});

	it('throws a descriptive error when base URL is empty string', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: '' }));
		const { buildApiUrl } = await import('../api-config.js');

		expect(() => buildApiUrl('/api/health')).toThrow('PUBLIC_API_URL is not set');
	});
});

// ─── buildWsUrl ────────────────────────────────────────────────────────────

describe('buildWsUrl', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('uses ws:// protocol when base URL is http://', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080' }));
		const { buildWsUrl } = await import('../api-config.js');

		const result = buildWsUrl('/api/jobs/abc/progress');
		expect(result).toBe('ws://localhost:8080/api/jobs/abc/progress');
	});

	it('uses wss:// protocol when base URL is https://', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'https://api.metacleaner.com' }));
		const { buildWsUrl } = await import('../api-config.js');

		const result = buildWsUrl('/api/jobs/abc/progress');
		expect(result).toBe('wss://api.metacleaner.com/api/jobs/abc/progress');
	});

	it('strips http:// protocol from host', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080' }));
		const { buildWsUrl } = await import('../api-config.js');

		const result = buildWsUrl('/ws');
		expect(result.startsWith('http://')).toBe(false);
		expect(result.startsWith('https://')).toBe(false);
	});

	it('preserves port in host', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'https://host.example.com:8443' }));
		const { buildWsUrl } = await import('../api-config.js');

		expect(buildWsUrl('/api/jobs/x/progress')).toBe(
			'wss://host.example.com:8443/api/jobs/x/progress'
		);
	});

	it('throws a descriptive error when base URL is empty string', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: '' }));
		const { buildWsUrl } = await import('../api-config.js');

		expect(() => buildWsUrl('/ws')).toThrow('PUBLIC_API_URL is not set');
	});
});

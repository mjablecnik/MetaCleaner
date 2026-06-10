import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Property 1: API URL construction preserves base and path
describe('Feature: api-integration, Property 1: API URL construction preserves base and path', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('buildApiUrl returns base URL concatenated with path for any path string', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080' }));
		const { buildApiUrl } = await import('../metaCleanerApi.js');

		fc.assert(
			fc.property(fc.string(), (path) => {
				const result = buildApiUrl(path);
				expect(result).toBe(`http://localhost:8080${path}`);
			}),
			{ numRuns: 100 }
		);
	});

	it('buildApiUrl with known API endpoint paths preserves base and full path', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080' }));
		const { buildApiUrl } = await import('../metaCleanerApi.js');

		const knownPaths = [
			'/api/upload',
			'/api/jobs',
			'/api/jobs/abc-123',
			'/api/jobs/abc-123/download',
			'/api/files/f-deadbeef.jpg/download',
			'/api/reports',
			'/api/reports/MC-2025-001',
			'/api/reports/MC-2025-001/pdf',
			'/api/health'
		];

		for (const path of knownPaths) {
			expect(buildApiUrl(path)).toBe(`http://localhost:8080${path}`);
		}
	});
});

// Property 2: WebSocket URL protocol derivation
describe('Feature: api-integration, Property 2: WebSocket URL protocol derivation', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('buildWsUrl uses ws:// protocol for any path when base URL is http://', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080' }));
		const { buildWsUrl } = await import('../metaCleanerApi.js');

		fc.assert(
			fc.property(fc.webPath(), (path) => {
				const result = buildWsUrl(path);
				expect(result.startsWith('ws://')).toBe(true);
				expect(result).toBe(`ws://localhost:8080${path}`);
			}),
			{ numRuns: 100 }
		);
	});

	it('buildWsUrl uses wss:// protocol for any path when base URL is https://', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'https://api.example.com' }));
		const { buildWsUrl } = await import('../metaCleanerApi.js');

		fc.assert(
			fc.property(fc.webPath(), (path) => {
				const result = buildWsUrl(path);
				expect(result.startsWith('wss://')).toBe(true);
				expect(result).toBe(`wss://api.example.com${path}`);
			}),
			{ numRuns: 100 }
		);
	});

	it('buildWsUrl preserves host with port and appends path', async () => {
		vi.doMock('$env/static/public', () => ({
			PUBLIC_API_URL: 'https://host.example.com:8443'
		}));
		const { buildWsUrl } = await import('../metaCleanerApi.js');

		const result = buildWsUrl('/api/jobs/abc-123/progress');
		expect(result).toBe('wss://host.example.com:8443/api/jobs/abc-123/progress');
	});

	it('buildWsUrl never produces a URL with http:// or https:// protocol', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:8080' }));
		const { buildWsUrl } = await import('../metaCleanerApi.js');

		fc.assert(
			fc.property(fc.webPath(), (path) => {
				const result = buildWsUrl(path);
				expect(result.startsWith('http://')).toBe(false);
				expect(result.startsWith('https://')).toBe(false);
			}),
			{ numRuns: 50 }
		);
	});
});

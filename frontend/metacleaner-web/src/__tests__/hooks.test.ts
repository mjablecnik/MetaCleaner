import { describe, it, expect, vi } from 'vitest';

// Mock deLocalizeUrl before importing hooks.ts.
// Simulates paraglide's behavior: strip the /cs locale prefix when present.
vi.mock('$lib/paraglide/runtime', () => ({
	deLocalizeUrl: (url: URL): URL => {
		const path = url.pathname;
		if (path === '/cs' || path.startsWith('/cs/')) {
			const delocalized = path.slice(3) || '/';
			return new URL(delocalized, url.origin);
		}
		return new URL(path, url.origin);
	}
}));

import { reroute } from '../hooks.ts';

describe('reroute', () => {
	it('strips the /cs locale prefix from a localized path', () => {
		const url = new URL('https://metacleaner.app/cs/pricing');
		expect(reroute({ url, fetch: globalThis.fetch })).toBe('/pricing');
	});

	it('strips /cs prefix from the root locale path returning /', () => {
		const url = new URL('https://metacleaner.app/cs');
		expect(reroute({ url, fetch: globalThis.fetch })).toBe('/');
	});

	it('strips /cs prefix with nested path', () => {
		const url = new URL('https://metacleaner.app/cs/features');
		expect(reroute({ url, fetch: globalThis.fetch })).toBe('/features');
	});

	it('passes through an un-prefixed path unchanged', () => {
		const url = new URL('https://metacleaner.app/pricing');
		expect(reroute({ url, fetch: globalThis.fetch })).toBe('/pricing');
	});

	it('passes through root path unchanged', () => {
		const url = new URL('https://metacleaner.app/');
		expect(reroute({ url, fetch: globalThis.fetch })).toBe('/');
	});

	it('returns a pathname string (not the full URL)', () => {
		const url = new URL('https://metacleaner.app/cs/about');
		const result = reroute({ url, fetch: globalThis.fetch });
		expect(result).toBe('/about');
		expect(result).not.toContain('https://');
	});
});

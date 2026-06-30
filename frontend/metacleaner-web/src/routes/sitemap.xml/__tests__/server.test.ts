import { describe, it, expect, beforeAll } from 'vitest';
import { GET } from '../+server.ts';

const SITE = 'https://metacleaner.app';
const PATHS = ['', '/features', '/pricing', '/about', '/terms', '/privacy'];

describe('GET /sitemap.xml', () => {
	let response: Response;
	let body: string;

	// Run GET() once and share the result across all tests in this suite.
	// It has no side effects and needs no mocking.
	beforeAll(async () => {
		response = GET();
		body = await response.text();
	});

	it('responds with Content-Type application/xml', () => {
		expect(response.headers.get('Content-Type')).toBe('application/xml');
	});

	it('starts with the XML prolog', () => {
		expect(body).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
	});

	it('contains a <urlset> root element', () => {
		expect(body).toContain('<urlset');
		expect(body).toContain('</urlset>');
	});

	it('contains exactly 12 <loc> entries (6 paths × en + cs)', () => {
		const locs = body.match(/<loc>/g) ?? [];
		expect(locs.length).toBe(12);
	});

	it('emits an English <loc> entry for each path', () => {
		for (const p of PATHS) {
			expect(body).toContain(`<loc>${SITE}${p}</loc>`);
		}
	});

	it('emits a Czech <loc> entry for each path', () => {
		for (const p of PATHS) {
			expect(body).toContain(`<loc>${SITE}/cs${p}</loc>`);
		}
	});

	it('includes hreflang="en" alternate links for each path', () => {
		for (const p of PATHS) {
			expect(body).toContain(`hreflang="en" href="${SITE}${p}"`);
		}
	});

	it('includes hreflang="cs" alternate links for each path', () => {
		for (const p of PATHS) {
			expect(body).toContain(`hreflang="cs" href="${SITE}/cs${p}"`);
		}
	});

	it('includes hreflang="x-default" alternate links for each path', () => {
		for (const p of PATHS) {
			expect(body).toContain(`hreflang="x-default" href="${SITE}${p}"`);
		}
	});

	it('has balanced <url> and </url> tags (well-formed)', () => {
		const openTags = body.match(/<url>/g) ?? [];
		const closeTags = body.match(/<\/url>/g) ?? [];
		expect(openTags.length).toBe(closeTags.length);
		expect(openTags.length).toBe(12);
	});
});

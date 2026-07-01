import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const NGINX_CONF = join(__dirname, '../../nginx.conf');

function parseCspHeader(nginxConf: string): string | null {
	const match = nginxConf.match(/add_header\s+Content-Security-Policy\s+"([^"]+)"/);
	return match ? match[1] : null;
}

function extractDirective(csp: string, name: string): string[] | null {
	const match = csp.match(new RegExp(`(?:^|;)\\s*${name}([^;]*)`));
	if (!match) return null;
	return match[1].trim().split(/\s+/);
}

describe('nginx.conf CSP compatibility', () => {
	it('nginx.conf exists and is readable', () => {
		const conf = readFileSync(NGINX_CONF, 'utf-8');
		expect(conf).toBeTruthy();
	});

	it('nginx CSP does not define script-src (SvelteKit meta CSP with hashes governs scripts)', () => {
		const conf = readFileSync(NGINX_CONF, 'utf-8');
		const csp = parseCspHeader(conf);
		if (!csp) return; // No CSP header at all — OK

		const scriptSrc = extractDirective(csp, 'script-src');
		expect(scriptSrc).toBeNull();
	});

	it('nginx CSP does not define default-src (which would act as script-src fallback and block inline scripts)', () => {
		const conf = readFileSync(NGINX_CONF, 'utf-8');
		const csp = parseCspHeader(conf);
		if (!csp) return;

		const defaultSrc = extractDirective(csp, 'default-src');
		expect(defaultSrc).toBeNull();
	});

	it('nginx CSP retains frame-ancestors self (clickjacking protection)', () => {
		const conf = readFileSync(NGINX_CONF, 'utf-8');
		const csp = parseCspHeader(conf);
		if (!csp) return;

		expect(csp).toContain("frame-ancestors 'self'");
	});

	it('nginx CSP retains object-src none (plugin execution blocked)', () => {
		const conf = readFileSync(NGINX_CONF, 'utf-8');
		const csp = parseCspHeader(conf);
		if (!csp) return;

		expect(csp).toContain("object-src 'none'");
	});
});

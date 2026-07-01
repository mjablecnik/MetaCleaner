const { mockDeLocalizeUrl } = vi.hoisted(() => ({
	mockDeLocalizeUrl: vi.fn()
}));

vi.mock('$lib/paraglide/runtime', () => ({
	deLocalizeUrl: mockDeLocalizeUrl
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reroute } from '../hooks.js';

beforeEach(() => {
	mockDeLocalizeUrl.mockReset();
});

describe('reroute — deLocalizeUrl delegation', () => {
	it('returns the pathname from deLocalizeUrl(url)', () => {
		mockDeLocalizeUrl.mockReturnValue(new URL('http://localhost/dashboard'));
		const result = reroute({ url: new URL('http://localhost/en/dashboard') } as never);
		expect(result).toBe('/dashboard');
	});

	it('passes the request url to deLocalizeUrl', () => {
		const input = new URL('http://localhost/cs/dostupnost');
		mockDeLocalizeUrl.mockReturnValue(new URL('http://localhost/dostupnost'));
		reroute({ url: input } as never);
		expect(mockDeLocalizeUrl).toHaveBeenCalledWith(input);
	});

	it('strips locale prefix: /en/login → /login', () => {
		mockDeLocalizeUrl.mockReturnValue(new URL('http://localhost/login'));
		const result = reroute({ url: new URL('http://localhost/en/login') } as never);
		expect(result).toBe('/login');
	});

	it('returns pathname only — not the full URL', () => {
		mockDeLocalizeUrl.mockReturnValue(new URL('http://example.com/some/path?q=1'));
		const result = reroute({ url: new URL('http://example.com/cs/some/path?q=1') } as never);
		expect(result).toBe('/some/path');
	});

	it('handles root path', () => {
		mockDeLocalizeUrl.mockReturnValue(new URL('http://localhost/'));
		const result = reroute({ url: new URL('http://localhost/') } as never);
		expect(result).toBe('/');
	});
});

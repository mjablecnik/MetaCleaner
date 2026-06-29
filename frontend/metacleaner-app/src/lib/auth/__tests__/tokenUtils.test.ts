import { describe, it, expect } from 'vitest';
import { extractCallbackParams } from '../token-utils.js';

describe('extractCallbackParams', () => {
	describe('valid token URLs', () => {
		it('extracts tokens from a full HTTPS URL', () => {
			const url =
				'https://app.metacleaner.com/api/auth/oauth/callback?access_token=acc&refresh_token=ref&expires_in=3600';
			const result = extractCallbackParams(url);
			expect(result).toEqual({
				tokens: { accessToken: 'acc', refreshToken: 'ref', expiresIn: 3600 }
			});
		});

		it('extracts tokens from a bare query string', () => {
			const url = '?access_token=myacc&refresh_token=myref&expires_in=7200';
			const result = extractCallbackParams(url);
			expect(result).toEqual({
				tokens: { accessToken: 'myacc', refreshToken: 'myref', expiresIn: 7200 }
			});
		});

		it('defaults expires_in to 3600 when parameter is absent', () => {
			const url = '?access_token=acc&refresh_token=ref';
			const result = extractCallbackParams(url);
			expect(result.tokens?.expiresIn).toBe(3600);
		});

		it('handles tokens with special characters (URL-encoded)', () => {
			const encodedAcc = encodeURIComponent('tok+/=special');
			const encodedRef = encodeURIComponent('ref+/=special');
			const url = `?access_token=${encodedAcc}&refresh_token=${encodedRef}&expires_in=3600`;
			const result = extractCallbackParams(url);
			expect(result.tokens?.accessToken).toBe('tok+/=special');
			expect(result.tokens?.refreshToken).toBe('ref+/=special');
		});

		it('returns first value when duplicate params are present', () => {
			const url = '?access_token=first&access_token=second&refresh_token=ref&expires_in=3600';
			const result = extractCallbackParams(url);
			expect(result.tokens?.accessToken).toBe('first');
		});
	});

	describe('error param handling', () => {
		it('returns error when error param is present', () => {
			const url = '?error=access_denied';
			const result = extractCallbackParams(url);
			expect(result).toEqual({ error: 'access_denied' });
		});

		it('returns error and ignores tokens when both error and tokens are present', () => {
			const url = '?error=server_error&access_token=acc&refresh_token=ref';
			const result = extractCallbackParams(url);
			expect(result).toEqual({ error: 'server_error' });
			expect(result.tokens).toBeUndefined();
		});
	});

	describe('incomplete or missing params', () => {
		it('returns empty object when access_token is missing', () => {
			const url = '?refresh_token=ref&expires_in=3600';
			expect(extractCallbackParams(url)).toEqual({});
		});

		it('returns empty object when refresh_token is missing', () => {
			const url = '?access_token=acc&expires_in=3600';
			expect(extractCallbackParams(url)).toEqual({});
		});

		it('returns empty object when no params are present', () => {
			expect(extractCallbackParams('https://app.metacleaner.com/dashboard')).toEqual({});
		});

		it('returns empty object for an empty string', () => {
			expect(extractCallbackParams('')).toEqual({});
		});
	});

	describe('fragment (hash) URLs', () => {
		it('extracts tokens from fragment-only URLs (Supabase implicit flow uses hash fragments)', () => {
			// Supabase may redirect with tokens in the hash fragment depending on flow type.
			// extractCallbackParams falls back to hash parsing when no access_token is in
			// query params, so extractAndCleanBrowserTokens works correctly for both flows.
			const url = 'https://app.metacleaner.com/callback#access_token=tok&refresh_token=ref';
			expect(extractCallbackParams(url)).toEqual({
				tokens: { accessToken: 'tok', refreshToken: 'ref', expiresIn: 3600 }
			});
		});

		it('handles URLs with both query params and a fragment — uses query params', () => {
			const url =
				'https://app.metacleaner.com/callback?access_token=qry&refresh_token=ref&expires_in=3600#ignored=fragment';
			const result = extractCallbackParams(url);
			expect(result.tokens?.accessToken).toBe('qry');
		});
	});

	describe('malformed URLs', () => {
		it('returns empty object for an entirely invalid URL string', () => {
			expect(extractCallbackParams(':::not-a-url:::')).toEqual({});
		});

		it('handles a path-only string without a leading slash', () => {
			// Without '?' these are treated as paths, not query strings
			const url = 'access_token=acc';
			// Parsed as "https://x" + url — URLSearchParams will be empty, so {} is returned
			expect(extractCallbackParams(url)).toEqual({});
		});
	});
});

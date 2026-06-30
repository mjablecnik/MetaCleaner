import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted above const declarations, so mock functions must be
// created with vi.hoisted() so they are available inside the factory callbacks.
const { mockParaglideMiddleware, mockGetTextDirection } = vi.hoisted(() => ({
	mockParaglideMiddleware: vi.fn(),
	mockGetTextDirection: vi.fn()
}));

vi.mock('$lib/paraglide/server', () => ({
	paraglideMiddleware: mockParaglideMiddleware
}));

vi.mock('$lib/paraglide/runtime', () => ({
	getTextDirection: mockGetTextDirection
}));

import { handle } from '../hooks.server.ts';

describe('handle (hooks.server.ts)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	function buildEvent(request: Request) {
		return { request } as unknown as Parameters<typeof handle>[0]['event'];
	}

	function callHandle(html: string, locale: string) {
		// Simulate what paraglideMiddleware does: call the inner callback with
		// an (optionally rewritten) request and a locale, then return whatever
		// the inner callback returns.
		mockParaglideMiddleware.mockImplementation(
			(_request: Request, callback: (opts: { request: Request; locale: string }) => unknown) =>
				callback({ request: _request, locale })
		);

		mockGetTextDirection.mockImplementation((l: string) => (l === 'cs' ? 'ltr' : 'ltr'));

		const resolve = vi.fn().mockImplementation(
			(_event: unknown, opts: { transformPageChunk: (chunk: { html: string }) => string }) =>
				opts.transformPageChunk({ html })
		);

		const event = buildEvent(new Request('https://metacleaner.app/'));
		return { result: handle({ event, resolve }), resolve };
	}

	it('replaces %paraglide.lang% with the detected locale', () => {
		const { result } = callHandle('<html lang="%paraglide.lang%">', 'en');
		expect(result).toBe('<html lang="en">');
	});

	it('replaces %paraglide.dir% with the text direction for the locale', () => {
		mockGetTextDirection.mockReturnValue('ltr');
		const { result } = callHandle('<html dir="%paraglide.dir%">', 'en');
		expect(result).toBe('<html dir="ltr">');
	});

	it('passes the locale to getTextDirection', () => {
		mockGetTextDirection.mockReturnValue('ltr');
		callHandle('dir="%paraglide.dir%"', 'cs');
		expect(mockGetTextDirection).toHaveBeenCalledWith('cs');
	});

	it('replaces both placeholders in the same html string', () => {
		mockGetTextDirection.mockReturnValue('ltr');
		const { result } = callHandle(
			'<html lang="%paraglide.lang%" dir="%paraglide.dir%">',
			'cs'
		);
		expect(result).toBe('<html lang="cs" dir="ltr">');
	});

	it('leaves html unchanged when neither placeholder is present', () => {
		mockGetTextDirection.mockReturnValue('ltr');
		const html = '<html lang="en" dir="ltr">';
		const { result } = callHandle(html, 'en');
		expect(result).toBe(html);
	});

	it('delegates to paraglideMiddleware passing the original request', () => {
		mockGetTextDirection.mockReturnValue('ltr');
		const request = new Request('https://metacleaner.app/cs/pricing');
		const event = buildEvent(request);
		const resolve = vi.fn().mockReturnValue('');
		mockParaglideMiddleware.mockImplementation(
			(req: Request, callback: (opts: { request: Request; locale: string }) => unknown) => {
				expect(req).toBe(request);
				return callback({ request: req, locale: 'cs' });
			}
		);
		handle({ event, resolve });
		expect(mockParaglideMiddleware).toHaveBeenCalledOnce();
	});

	it('mutates event.request to the (possibly rewritten) request from middleware', () => {
		mockGetTextDirection.mockReturnValue('ltr');
		const rewrittenRequest = new Request('https://metacleaner.app/pricing');
		mockParaglideMiddleware.mockImplementation(
			(_req: Request, callback: (opts: { request: Request; locale: string }) => unknown) =>
				callback({ request: rewrittenRequest, locale: 'cs' })
		);

		const event = buildEvent(new Request('https://metacleaner.app/cs/pricing'));
		const resolve = vi.fn().mockReturnValue('');
		handle({ event, resolve });

		expect(event.request).toBe(rewrittenRequest);
	});

	it('passes event and transformPageChunk option to resolve', () => {
		mockGetTextDirection.mockReturnValue('ltr');
		const { resolve } = callHandle('', 'en');
		expect(resolve).toHaveBeenCalledOnce();
		const [, opts] = resolve.mock.calls[0];
		expect(typeof opts.transformPageChunk).toBe('function');
	});

	it('returns the value returned by resolve', () => {
		mockParaglideMiddleware.mockImplementation(
			(_req: Request, callback: (opts: { request: Request; locale: string }) => unknown) =>
				callback({ request: _req, locale: 'en' })
		);
		mockGetTextDirection.mockReturnValue('ltr');
		const resolve = vi
			.fn()
			.mockImplementation(
				(_event: unknown, opts: { transformPageChunk: (c: { html: string }) => string }) =>
					opts.transformPageChunk({ html: 'DONE' })
			);
		const event = buildEvent(new Request('https://metacleaner.app/'));
		const result = handle({ event, resolve });
		expect(result).toBe('DONE');
	});
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const {
	mockAddListener,
	mockGoto,
	mockResolve,
	mockExtractCallbackParams,
	mockHandleAuthCallback
} = vi.hoisted(() => {
	const removeListener = vi.fn();
	return {
		mockAddListener: vi.fn().mockResolvedValue({ remove: removeListener }),
		mockGoto: vi.fn().mockResolvedValue(undefined),
		mockResolve: vi.fn((path: string) => path),
		mockExtractCallbackParams: vi.fn(),
		mockHandleAuthCallback: vi.fn().mockResolvedValue(null),
		mockRemoveListener: removeListener
	};
});

vi.mock('@capacitor/app', () => ({
	App: { addListener: mockAddListener }
}));
vi.mock('$app/navigation', () => ({ goto: mockGoto }));
vi.mock('$app/paths', () => ({ resolve: mockResolve }));
vi.mock('../token-utils.js', () => ({
	extractCallbackParams: mockExtractCallbackParams,
	handleAuthCallback: mockHandleAuthCallback
}));

import { registerDeepLinkHandler } from '../deep-link.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Capture the appUrlOpen callback after registerDeepLinkHandler is called.
function captureAppUrlOpenCallback(): (event: { url: string }) => Promise<void> {
	const call = mockAddListener.mock.calls[0];
	return call?.[1] as (event: { url: string }) => Promise<void>;
}

// Deep link URLs must have a pathname of /api/auth/... to match CALLBACK_PATHS.
// Custom-scheme deep links use the form "scheme://host/path" which puts "host" in
// the hostname — so the path becomes /auth/..., not /api/auth/...
// Universal HTTPS links (or triple-slash custom schemes) keep /api/... in pathname.
const OAUTH_CALLBACK_URL = 'https://app.metacleaner.com/api/auth/oauth/callback';
const MAGIC_LINK_CALLBACK_URL = 'https://app.metacleaner.com/api/auth/magic-link/callback';

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('registerDeepLinkHandler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		const removeListener = vi.fn();
		mockAddListener.mockResolvedValue({ remove: removeListener });
	});

	it('registers an appUrlOpen listener on the Capacitor App', async () => {
		await registerDeepLinkHandler();
		expect(mockAddListener).toHaveBeenCalledWith('appUrlOpen', expect.any(Function));
	});

	it('returns a cleanup function that removes the listener', async () => {
		const removeFn = vi.fn();
		mockAddListener.mockResolvedValue({ remove: removeFn });
		const cleanup = await registerDeepLinkHandler();
		cleanup();
		expect(removeFn).toHaveBeenCalledOnce();
	});

	it('ignores URLs that are not auth callback paths', async () => {
		await registerDeepLinkHandler();
		const callback = captureAppUrlOpenCallback();
		await callback({ url: 'https://app.metacleaner.com/home' });
		expect(mockExtractCallbackParams).not.toHaveBeenCalled();
		expect(mockGoto).not.toHaveBeenCalled();
	});

	it('ignores URLs with a non-matching pathname', async () => {
		await registerDeepLinkHandler();
		const callback = captureAppUrlOpenCallback();
		await callback({ url: 'https://app.metacleaner.com/dashboard?access_token=tok' });
		// /dashboard does not match CALLBACK_PATHS, so extractCallbackParams is never called.
		expect(mockExtractCallbackParams).not.toHaveBeenCalled();
	});

	it('navigates to /login and stores error when callback URL has an error param', async () => {
		mockExtractCallbackParams.mockReturnValue({ error: 'access_denied' });
		const mockSetItem = vi.fn();
		vi.stubGlobal('sessionStorage', {
			setItem: mockSetItem,
			getItem: vi.fn(),
			removeItem: vi.fn()
		});
		await registerDeepLinkHandler();
		const callback = captureAppUrlOpenCallback();
		await callback({ url: `${OAUTH_CALLBACK_URL}?error=access_denied` });
		expect(mockSetItem).toHaveBeenCalledWith('mc_deep_link_error', 'access_denied');
		expect(mockGoto).toHaveBeenCalledWith('/login');
		expect(mockHandleAuthCallback).not.toHaveBeenCalled();
	});

	it('calls handleAuthCallback when callback URL contains valid tokens', async () => {
		mockExtractCallbackParams.mockReturnValue({
			tokens: { accessToken: 'tok', refreshToken: 'ref', expiresIn: 3600 }
		});
		await registerDeepLinkHandler();
		const callback = captureAppUrlOpenCallback();
		const url = `${OAUTH_CALLBACK_URL}?access_token=tok&refresh_token=ref&expires_in=3600`;
		await callback({ url });
		expect(mockHandleAuthCallback).toHaveBeenCalledWith(url, false);
		expect(mockGoto).not.toHaveBeenCalled();
	});

	it('does not call handleAuthCallback when callback returns neither tokens nor error', async () => {
		mockExtractCallbackParams.mockReturnValue({});
		await registerDeepLinkHandler();
		const callback = captureAppUrlOpenCallback();
		await callback({ url: OAUTH_CALLBACK_URL });
		expect(mockHandleAuthCallback).not.toHaveBeenCalled();
		expect(mockGoto).not.toHaveBeenCalled();
	});

	it('processes magic-link callback URLs as well as OAuth URLs', async () => {
		mockExtractCallbackParams.mockReturnValue({
			tokens: { accessToken: 'magic-tok', refreshToken: 'magic-ref', expiresIn: 3600 }
		});
		await registerDeepLinkHandler();
		const callback = captureAppUrlOpenCallback();
		const url = `${MAGIC_LINK_CALLBACK_URL}?access_token=magic-tok&refresh_token=magic-ref`;
		await callback({ url });
		expect(mockHandleAuthCallback).toHaveBeenCalledWith(url, false);
	});
});

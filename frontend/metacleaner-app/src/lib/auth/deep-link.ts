import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { extractCallbackParams, handleAuthCallback } from './token-utils.js';

const CALLBACK_PATHS = ['/api/auth/oauth/callback', '/api/auth/magic-link/callback'];

function isAuthCallbackUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return CALLBACK_PATHS.some((path) => parsed.pathname === path);
	} catch {
		return false;
	}
}

/**
 * Registers a Capacitor App deep link listener that intercepts OAuth and magic link
 * callback URLs. Extracts tokens and stores them; navigates to main app on success
 * or shows an error on the login page on failure. (Req 19.4, 19.5, 19.9)
 *
 * Must be called once during app initialization in a browser/Capacitor context.
 * Returns a cleanup function to remove the listener.
 */
export async function registerDeepLinkHandler(): Promise<() => void> {
	const { App } = await import('@capacitor/app');

	const listener = await App.addListener('appUrlOpen', async (event) => {
		if (!isAuthCallbackUrl(event.url)) return;

		const result = extractCallbackParams(event.url);

		if (result.error) {
			// Store the error so the login page can display it after navigation (Req 19.9)
			sessionStorage.setItem('mc_deep_link_error', result.error);
			await goto(resolve('/login' as Pathname));
			return;
		}

		if (result.tokens) {
			// Store tokens and navigate to main app (Req 19.5, 19.6)
			await handleAuthCallback(event.url, false);
		}
	});

	return () => {
		listener.remove();
	};
}

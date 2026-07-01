import type { Page } from 'playwright/test';

/**
 * Injects auth tokens so guardProtectedRoute() lets the page render.
 *
 * Auth flow: _restore() purges mc_access_token and re-authenticates via
 * POST /api/auth/refresh using mc_refresh_token. Call this before goto().
 */
export async function injectAuth(page: Page): Promise<void> {
	await page.addInitScript(() => {
		const farFuture = String(Date.now() + 3600 * 1000);
		localStorage.setItem('mc_refresh_token', 'fake-refresh-token');
		localStorage.setItem('mc_token_expires_at', farFuture);
	});

	await page.route('**/api/auth/refresh', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				access_token: 'mock-access-token',
				refresh_token: 'fake-refresh-token',
				expires_in: 3600,
				user: { id: 'user-1', email: 'test@example.com', name: 'Test User' }
			})
		})
	);

	await page.route('**/api/auth/me', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ id: 'user-1', email: 'test@example.com', name: 'Test User' })
		})
	);
}

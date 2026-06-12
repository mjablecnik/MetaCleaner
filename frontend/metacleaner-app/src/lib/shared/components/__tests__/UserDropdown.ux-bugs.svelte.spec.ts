// Bug Condition 5: UserDropdown should render "Report history" menu item.
// EXPECTED OUTCOME: FAILS on unfixed code (only Settings and Logout are present).
// Requires browser/Playwright to run (vitest --project=client).
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UserDropdown from '../UserDropdown.svelte';

const mockUser = { name: 'Test User', email: 'test@example.com' };

describe('Bug Condition 5: UserDropdown — Report history menu item', () => {
	// EXPECTED OUTCOME: FAILS on unfixed code (no "Report history" link exists)
	it('renders Report history link navigating to /reports (EXPECTED BEHAVIOR)', async () => {
		render(UserDropdown, { user: mockUser, open: true });
		// Bug 5: currently only Settings and Logout exist — Report history is missing
		const reportHistoryLink = page.getByRole('link', { name: /report history/i });
		await expect.element(reportHistoryLink).toBeInTheDocument();
		const href = reportHistoryLink.element().getAttribute('href');
		expect(href).toContain('/reports');
	});

	// Preservation: existing Settings and Logout items remain (EXPECTED OUTCOME: PASSES)
	it('still renders Settings and Logout items', async () => {
		render(UserDropdown, { user: mockUser, open: true });
		const settingsItem = page.getByText(/settings/i);
		const logoutItem = page.getByText(/log out/i);
		await expect.element(settingsItem).toBeInTheDocument();
		await expect.element(logoutItem).toBeInTheDocument();
	});

	// Preservation: Report history appears before Settings (above in list)
	it('Report history is listed before Settings in dropdown order (EXPECTED BEHAVIOR)', async () => {
		render(UserDropdown, { user: mockUser, open: true });
		const links = page.getByRole('link');
		const linkTexts: string[] = [];
		const linkElements = links.elements();
		for (const el of linkElements) {
			const text = el.textContent;
			if (text) linkTexts.push(text.trim());
		}
		const reportHistoryIdx = linkTexts.findIndex((t) => /report history/i.test(t));
		const settingsIdx = linkTexts.findIndex((t) => /settings/i.test(t));
		expect(reportHistoryIdx).toBeGreaterThanOrEqual(0);
		expect(reportHistoryIdx).toBeLessThan(settingsIdx);
	});
});

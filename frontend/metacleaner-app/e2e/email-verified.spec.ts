import { test, expect, type Page } from 'playwright/test';

async function navigateToEmailVerified(page: Page) {
	await page.goto('/email-verified');
	await expect(page.locator('nav').getByText('MetaCleaner', { exact: true }).first()).toBeVisible({
		timeout: 8000
	});
}

// ─── Core content ─────────────────────────────────────────────────────────────

test.describe('Email Verified — core content', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('page title is correct', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page).toHaveTitle(/Email Verified/);
	});

	test('nav shows brand name and "Account verified" badge', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(
			page.locator('nav').getByText('MetaCleaner', { exact: true }).first()
		).toBeVisible();
		await expect(page.locator('nav').getByText('Account verified', { exact: true })).toBeVisible();
	});

	test('hero heading "Email verified!" is visible in success card', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(
			page.locator('.lg\\:grid').getByRole('heading', { name: /email verified/i })
		).toBeVisible();
	});

	test('progress stepper shows all 3 steps', async ({ page }) => {
		await navigateToEmailVerified(page);
		const desktop = page.locator('.lg\\:grid');
		await expect(desktop.getByText('Account created').first()).toBeVisible();
		await expect(desktop.getByText('Email verified', { exact: true })).toBeVisible();
		await expect(desktop.getByText('Start cleaning')).toBeVisible();
	});

	test('stats row shows user and file statistics', async ({ page }) => {
		await navigateToEmailVerified(page);
		const desktop = page.locator('.lg\\:grid');
		await expect(desktop.getByText('50K+')).toBeVisible();
		await expect(desktop.getByText('2M+')).toBeVisible();
		await expect(desktop.getByText('100%')).toBeVisible();
	});

	test('"what\'s next?" section with action cards is visible', async ({ page }) => {
		await navigateToEmailVerified(page);
		const desktop = page.locator('.lg\\:grid');
		await expect(desktop.getByText("what's next?")).toBeVisible();
		await expect(desktop.getByText('Clean your first file')).toBeVisible();
		await expect(desktop.getByText('Try Pro')).toBeVisible();
	});

	test('CTA "Sign in to MetaCleaner" link is visible', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(
			page.locator('.lg\\:grid').getByRole('link', { name: /sign in to metacleaner/i })
		).toBeVisible();
	});

	test('"Download ebook" button is visible', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(
			page.locator('.lg\\:grid').getByRole('button', { name: /download ebook/i })
		).toBeVisible();
	});

	test('trust badges are visible', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('.lg\\:grid').getByText('No tracking')).toBeVisible();
	});
});

// ─── Navigation ────────────────────────────────────────────────────────────────

test.describe('Email Verified — navigation', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('"Sign in to MetaCleaner" CTA navigates to home page', async ({ page }) => {
		await navigateToEmailVerified(page);
		await page
			.locator('.lg\\:grid')
			.getByRole('link', { name: /sign in to metacleaner/i })
			.click();
		await page.waitForURL('**/', { timeout: 8000 });
		await expect(page).toHaveURL(/\/$/);
	});
});

// ─── Responsive — mobile (375px) ──────────────────────────────────────────────

test.describe('Email Verified — mobile viewport (375px)', () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test('mobile single-column layout is visible', async ({ page }) => {
		await navigateToEmailVerified(page);
		const mobileLayout = page
			.locator('.lg\\:hidden')
			.filter({ hasText: 'Email verified!' })
			.first();
		await expect(mobileLayout).toBeVisible();
	});

	test('desktop two-column layout is hidden on mobile', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('.lg\\:grid').first()).not.toBeVisible();
	});

	test('h1 "Email verified!" heading is visible on mobile', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.getByRole('heading', { level: 1, name: /email verified/i })).toBeVisible();
	});

	test('"Verified" badge is visible in nav on mobile', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('nav').getByText('Verified', { exact: true })).toBeVisible();
	});

	test('progress stepper steps are visible on mobile', async ({ page }) => {
		await navigateToEmailVerified(page);
		const mobileLayout = page.locator('main > .lg\\:hidden');
		await expect(mobileLayout.getByText('Account created').first()).toBeVisible();
		await expect(mobileLayout.getByText('Start cleaning').first()).toBeVisible();
	});

	test('stats cards are visible on mobile', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('main > .lg\\:hidden').getByText('50K+')).toBeVisible();
	});

	test('CTA "Sign in to MetaCleaner" link is visible on mobile', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(
			page.locator('main > .lg\\:hidden').getByRole('link', { name: /sign in to metacleaner/i })
		).toBeVisible();
	});
});

// ─── Responsive — desktop (1280px) ────────────────────────────────────────────

test.describe('Email Verified — desktop viewport (1280px)', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('desktop two-column layout is visible', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('.lg\\:grid').first()).toBeVisible();
	});

	test('mobile single-column layout is hidden on desktop', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('main > .lg\\:hidden')).not.toBeVisible();
	});

	test('left info panel headline is visible on desktop', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('.lg\\:grid').getByText('Your account is fully')).toBeVisible();
	});

	test('"Account verified" badge is visible in nav on desktop', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(page.locator('nav').getByText('Account verified', { exact: true })).toBeVisible();
	});

	test('success card hero h2 "Email verified!" is visible on desktop', async ({ page }) => {
		await navigateToEmailVerified(page);
		await expect(
			page.locator('.lg\\:grid').getByRole('heading', { level: 2, name: /email verified/i })
		).toBeVisible();
	});
});

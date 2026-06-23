import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavBar from '../NavBar.svelte';
import type { Language } from '$lib/repositories/languageRepository';
import type { User } from '$lib/repositories/userRepository';

const mockUser: User = { name: 'Test User', email: 'test@example.com' };
const mockLangOptions: Language[] = [
	{ code: 'cs', flag: '/flags/cs.svg', label: 'CS', name: 'Čeština' },
	{ code: 'en', flag: '/flags/en.svg', label: 'EN', name: 'English' }
];

describe('NavBar', () => {
	it('renders navigation element', async () => {
		render(NavBar, { user: mockUser, langOptions: mockLangOptions });
		await expect.element(page.getByRole('navigation')).toBeInTheDocument();
	});

	it('hamburger menu component is always rendered', async () => {
		const { container } = render(NavBar, { user: mockUser, langOptions: mockLangOptions });
		// MobileHamburgerMenu is always rendered (no mobileStyle gate)
		await expect.element(page.getByRole('navigation')).toBeInTheDocument();
		// The hamburger wrapper uses id="nav-hamburgerDropdown"
		const hamburger = container.querySelector('#nav-hamburgerDropdown');
		expect(hamburger).not.toBeNull();
	});

	it('shows back button on desktop when showBackButton is true', async () => {
		render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			showBackButton: true,
			backLabel: 'Zpět na čištění',
			backHref: '/'
		});
		// Desktop back button has the backLabel text
		await expect.element(page.getByText('Zpět na čištění')).toBeInTheDocument();
	});

	it('does not show back arrow by default', async () => {
		const { container } = render(NavBar, { user: mockUser, langOptions: mockLangOptions });
		// No "go back" link should appear without showBackButton
		const backLink = container.querySelector('a[aria-label="Go back"]');
		expect(backLink).toBeNull();
	});

	it('applies noPrint class when noPrint is true', async () => {
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			noPrint: true
		});
		const nav = container.querySelector('nav');
		expect(nav?.classList.contains('no-print')).toBe(true);
	});

	it('does not apply noPrint class by default', async () => {
		const { container } = render(NavBar, { user: mockUser, langOptions: mockLangOptions });
		const nav = container.querySelector('nav');
		expect(nav?.classList.contains('no-print')).toBe(false);
	});

	it('wraps logo in anchor when logoHref is provided', async () => {
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			logoHref: '/'
		});
		// Logo should be wrapped in an anchor tag
		const logoAnchor = container.querySelector('a[href="/"]');
		expect(logoAnchor).not.toBeNull();
	});

	it('shows mobile back arrow button when showBackButton is true', async () => {
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			showBackButton: true,
			backHref: '/'
		});
		// Mobile back button: <a aria-label="Go back">
		const mobileBack = container.querySelector('a[aria-label="Go back"]');
		expect(mobileBack).not.toBeNull();
	});
});

// Bug 4: Back button must call history.back() (backAction callback) not navigate to /reports.
// Integration test verifying NavBar renders <button> (not <a>) when backAction is provided,
// and that clicking it fires the callback.
describe('Bug Condition 4: NavBar backAction callback — history.back() integration', () => {
	it('renders mobile back button as <button> (not <a>) when backAction is provided', async () => {
		const backAction = vi.fn();
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			showBackButton: true,
			backAction
		});
		// With backAction, mobile back is a <button aria-label="Go back">, not an <a> tag
		const mobileBackBtn = container.querySelector('button[aria-label="Go back"]');
		expect(mobileBackBtn).not.toBeNull();
		// And no <a> link should be used for back navigation
		const mobileBackLink = container.querySelector('a[aria-label="Go back"]');
		expect(mobileBackLink).toBeNull();
	});

	it('clicking mobile back button calls backAction callback (not navigation)', async () => {
		const backAction = vi.fn();
		render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			showBackButton: true,
			backAction,
			backLabel: 'Back to results'
		});
		const mobileBackBtn = page.getByRole('button', { name: /go back/i });
		await mobileBackBtn.click();
		expect(backAction).toHaveBeenCalledOnce();
	});

	it('clicking desktop back button calls backAction callback (not navigation)', async () => {
		const backAction = vi.fn();
		render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			showBackButton: true,
			backAction,
			backLabel: 'Back to results'
		});
		// Desktop back button has the backLabel text and is a <button> not <a>
		const desktopBackBtn = page.getByRole('button', { name: /back to results/i });
		await desktopBackBtn.click();
		expect(backAction).toHaveBeenCalledOnce();
	});

	it('renders desktop back button as <button> (not <a>) when backAction is provided', async () => {
		const backAction = vi.fn();
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			showBackButton: true,
			backAction,
			backLabel: 'Back to results'
		});
		// Desktop buttons have text content — find button containing "Back to results"
		const buttons = container.querySelectorAll('button');
		const backButtons = Array.from(buttons).filter((b) =>
			b.textContent?.includes('Back to results')
		);
		expect(backButtons.length).toBeGreaterThan(0);
		// None of them should be anchor tags
		const backLinks = container.querySelectorAll('a');
		const backAsLink = Array.from(backLinks).filter((a) =>
			a.textContent?.includes('Back to results')
		);
		expect(backAsLink).toHaveLength(0);
	});

	// Preservation 3.4: backHref renders <a> link (not button) when backAction absent
	it('renders mobile back as <a> link when only backHref is provided (preservation)', async () => {
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			showBackButton: true,
			backHref: '/reports',
			backLabel: 'Back to results'
		});
		// Without backAction, mobile back is a link <a aria-label="Go back">
		const mobileBackLink = container.querySelector('a[aria-label="Go back"]');
		expect(mobileBackLink).not.toBeNull();
		// And no button with "Go back" should exist
		const mobileBackBtn = container.querySelector('button[aria-label="Go back"]');
		expect(mobileBackBtn).toBeNull();
	});
});

// Bug 2: Logo click resets app state (onLogoClick callback) integration.
// Design spec (design.md): "Test cleaning flow → results → click logo → verify app resets to idle state"
// This verifies that when NavBar receives onLogoClick (provided by +layout.svelte in success state),
// clicking the logo fires the callback so appState.reset() can be triggered.
describe('Bug Condition 2: NavBar logo onLogoClick callback — app reset integration', () => {
	it('logo renders as <button> (not <a>) when onLogoClick is provided and logoHref is absent', async () => {
		const onLogoClick = vi.fn();
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			onLogoClick
		});
		// When onLogoClick is provided without logoHref, logo is wrapped in a <button>
		// (NavBar: {#if logoHref} <a> {:else if onLogoClick} <button>)
		// Logo button has bg-transparent p-0 classes — distinct from PlanPill (which has rounded-full border)
		const logoButton = container.querySelector('button.cursor-pointer.bg-transparent');
		expect(logoButton).not.toBeNull();
		// And no <a href="/"> wrapping the logo should exist
		const logoAnchor = container.querySelector('a[href="/"]');
		expect(logoAnchor).toBeNull();
	});

	it('clicking the logo button fires onLogoClick once (simulates appState.reset())', async () => {
		const onLogoClick = vi.fn();
		render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			onLogoClick
		});
		// The logo button contains the brand name text "MetaCleaner"
		const logoBtn = page.getByRole('button', { name: /MetaCleaner/i });
		await logoBtn.click();
		expect(onLogoClick).toHaveBeenCalledOnce();
	});

	it('logoHref takes precedence over onLogoClick — renders as <a> not <button> when both are set', async () => {
		const onLogoClick = vi.fn();
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions,
			logoHref: '/',
			onLogoClick
		});
		// NavBar: {#if logoHref} takes priority, renders <a> not <button>
		const logoAnchor = container.querySelector('a[href="/"]');
		expect(logoAnchor).not.toBeNull();
		// Logo button has bg-transparent p-0 classes — distinct from PlanPill (which has rounded-full border)
		const logoButton = container.querySelector('button.cursor-pointer.bg-transparent');
		expect(logoButton).toBeNull();
	});

	it('logo renders as plain div (no link or button) when neither logoHref nor onLogoClick is set', async () => {
		const { container } = render(NavBar, {
			user: mockUser,
			langOptions: mockLangOptions
		});
		// NavBar: {:else} renders a plain div with no interactivity
		const logoAnchor = container.querySelector('a[href="/"]');
		// Logo button has bg-transparent p-0 classes — distinct from PlanPill (which has rounded-full border)
		const logoButton = container.querySelector('button.cursor-pointer.bg-transparent');
		expect(logoAnchor).toBeNull();
		expect(logoButton).toBeNull();
	});
});

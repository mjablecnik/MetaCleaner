import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
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

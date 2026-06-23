import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CreditBalanceIndicator from '../CreditBalanceIndicator.svelte';

describe('CreditBalanceIndicator', () => {
	it('renders credit count when credits are loaded', async () => {
		render(CreditBalanceIndicator, { credits: 42, isLoading: false, hasError: false });
		await expect.element(page.getByText('42')).toBeInTheDocument();
	});

	it('renders credits label in non-compact mode', async () => {
		render(CreditBalanceIndicator, { credits: 5, isLoading: false, hasError: false });
		await expect.element(page.getByText('credits')).toBeInTheDocument();
	});

	it('omits credits label in compact mode', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: 5,
			isLoading: false,
			hasError: false,
			compact: true
		});
		// In compact mode, no text element for "credits" label should appear
		const spans = container.querySelectorAll('span');
		const hasCreditsLabel = Array.from(spans).some((s) => s.textContent?.trim() === 'credits');
		expect(hasCreditsLabel).toBe(false);
	});

	it('renders skeleton placeholder when loading with no cached data', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: null,
			isLoading: true,
			hasError: false
		});
		const skeleton = container.querySelector('.animate-pulse');
		expect(skeleton).not.toBeNull();
	});

	it('renders nothing when hasError and no cached data', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: null,
			isLoading: false,
			hasError: true
		});
		// The component renders nothing — container should have no visible pill or skeleton
		const pill = container.querySelector('.rounded-full');
		const skeleton = container.querySelector('.animate-pulse');
		expect(pill).toBeNull();
		expect(skeleton).toBeNull();
	});

	it('renders with warning (orange) styling when credits is 0', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: 0,
			isLoading: false,
			hasError: false
		});
		const pill = container.querySelector('.border-orange-500\\/40');
		expect(pill).not.toBeNull();
	});

	it('renders with success (green) styling when credits > 0', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: 10,
			isLoading: false,
			hasError: false
		});
		const pill = container.querySelector('.border-brand-green\\/30');
		expect(pill).not.toBeNull();
	});

	it('shows stale data warning icon when hasError=true but credits cached', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: 7,
			isLoading: false,
			hasError: true
		});
		const warningIcon = container.querySelector('.fa-exclamation-triangle');
		expect(warningIcon).not.toBeNull();
	});

	it('renders 99,999+ for very high credit counts', async () => {
		render(CreditBalanceIndicator, { credits: 100000, isLoading: false, hasError: false });
		await expect.element(page.getByText('99,999+')).toBeInTheDocument();
	});

	it('renders bolt icon', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: 5,
			isLoading: false,
			hasError: false
		});
		const bolt = container.querySelector('.fa-bolt');
		expect(bolt).not.toBeNull();
	});

	it('does not render stale warning icon when hasError=false', async () => {
		const { container } = render(CreditBalanceIndicator, {
			credits: 5,
			isLoading: false,
			hasError: false
		});
		const warningIcon = container.querySelector('.fa-exclamation-triangle');
		expect(warningIcon).toBeNull();
	});
});

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CreditsBanner from '../CreditsBanner.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

function makeDefaultProps(overrides: Record<string, unknown> = {}) {
	return {
		credits: 10,
		subscriptionCredits: 10,
		monthlyAllowance: 100,
		planId: 'pro',
		planStatus: 'active',
		isPaidPlan: true,
		...overrides
	};
}

describe('CreditsBanner', () => {
	it('shows upgrade CTA button when user is not on paid plan', async () => {
		render(
			CreditsBanner,
			makeDefaultProps({ isPaidPlan: false, planId: 'free', planStatus: 'free' })
		);
		await expect.element(page.getByText('Get Pro plan')).toBeInTheDocument();
	});

	it('hides upgrade CTA button for paid plan users', async () => {
		const { container } = render(CreditsBanner, makeDefaultProps({ isPaidPlan: true }));
		const buttons = container.querySelectorAll('button');
		const upgradeButtons = Array.from(buttons).filter((b) =>
			b.textContent?.includes('Get Pro plan')
		);
		expect(upgradeButtons).toHaveLength(0);
	});

	it('renders bolt icon', async () => {
		const { container } = render(CreditsBanner, makeDefaultProps());
		const bolt = container.querySelector('.fa-bolt');
		expect(bolt).not.toBeNull();
	});

	it('shows Credit balance title', async () => {
		render(CreditsBanner, makeDefaultProps());
		await expect.element(page.getByText('Credit balance')).toBeInTheDocument();
	});

	it('shows subscriptionCredits count', async () => {
		// Both desktop and mobile layouts render the count; use textContent check to avoid strict mode
		const { container } = render(CreditsBanner, makeDefaultProps({ subscriptionCredits: 42 }));
		expect(container.textContent).toContain('42');
	});

	it('shows monthlyAllowance', async () => {
		// Both desktop and mobile layouts render the allowance; use textContent check
		const { container } = render(CreditsBanner, makeDefaultProps({ monthlyAllowance: 100 }));
		expect(container.textContent).toContain('100');
	});

	it('renders plan badge with correct label for pro plan', async () => {
		// Plan label appears in both desktop and mobile badges; use textContent check
		const { container } = render(
			CreditsBanner,
			makeDefaultProps({ planId: 'pro', planStatus: 'active' })
		);
		expect(container.textContent).toContain('Pro');
	});

	it('renders plan badge for free plan', async () => {
		// Plan label appears in both desktop and mobile badges; use textContent check
		const { container } = render(
			CreditsBanner,
			makeDefaultProps({ planId: 'free', planStatus: 'free', isPaidPlan: false })
		);
		expect(container.textContent).toContain('Free');
	});

	it('renders progress bar element', async () => {
		const { container } = render(CreditsBanner, makeDefaultProps());
		// ProgressBar renders a div with role="progressbar" or has a specific class
		const progressbar = container.querySelector('[role="progressbar"]');
		expect(progressbar).not.toBeNull();
	});
});

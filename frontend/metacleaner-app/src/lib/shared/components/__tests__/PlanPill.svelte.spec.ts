import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PlanPill from '../PlanPill.svelte';

const { mockGoto } = vi.hoisted(() => ({ mockGoto: vi.fn() }));

vi.mock('$app/navigation', () => ({ goto: mockGoto }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

describe('PlanPill', () => {
	beforeEach(() => {
		mockGoto.mockClear();
	});

	it('renders Free label for free plan', async () => {
		render(PlanPill, { planId: 'free', planStatus: 'free' });
		await expect.element(page.getByText('Free')).toBeInTheDocument();
	});

	it('renders lock icon for free plan', async () => {
		const { container } = render(PlanPill, { planId: 'free', planStatus: 'free' });
		const lockIcon = container.querySelector('.fa-lock');
		expect(lockIcon).not.toBeNull();
	});

	it('renders gray styling for free plan', async () => {
		const { container } = render(PlanPill, { planId: 'free', planStatus: 'free' });
		const button = container.querySelector('button');
		expect(button?.className).toContain('border-gray-600');
	});

	it('renders Pro label for pro active plan', async () => {
		render(PlanPill, { planId: 'pro', planStatus: 'active' });
		await expect.element(page.getByText('Pro')).toBeInTheDocument();
	});

	it('renders star icon for pro active plan', async () => {
		const { container } = render(PlanPill, { planId: 'pro', planStatus: 'active' });
		const starIcon = container.querySelector('.fa-star');
		expect(starIcon).not.toBeNull();
	});

	it('renders blue styling for pro active plan', async () => {
		const { container } = render(PlanPill, { planId: 'pro', planStatus: 'active' });
		const button = container.querySelector('button');
		expect(button?.className).toContain('border-blue-600');
	});

	it('renders Pro+ label for proplus active plan', async () => {
		render(PlanPill, { planId: 'proplus', planStatus: 'active' });
		await expect.element(page.getByText('Pro+')).toBeInTheDocument();
	});

	it('renders star icon for proplus plan', async () => {
		const { container } = render(PlanPill, { planId: 'proplus', planStatus: 'active' });
		const starIcon = container.querySelector('.fa-star');
		expect(starIcon).not.toBeNull();
	});

	it('renders orange styling for proplus plan', async () => {
		const { container } = render(PlanPill, { planId: 'proplus', planStatus: 'active' });
		const button = container.querySelector('button');
		expect(button?.className).toContain('border-orange-600');
	});

	it('renders Free style for cancelled subscription', async () => {
		render(PlanPill, { planId: 'pro', planStatus: 'cancelled' });
		await expect.element(page.getByText('Free')).toBeInTheDocument();
	});

	it('renders as a button element', async () => {
		const { container } = render(PlanPill, { planId: 'free', planStatus: 'free' });
		const button = container.querySelector('button');
		expect(button).not.toBeNull();
	});

	it('clicking the pill calls goto with /pricing', async () => {
		render(PlanPill, { planId: 'free', planStatus: 'free' });
		const button = page.getByRole('button', { name: /free/i });
		await button.click();
		expect(mockGoto).toHaveBeenCalledWith('/pricing');
	});
});

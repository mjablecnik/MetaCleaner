import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UpgradeModal from '../UpgradeModal.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

describe('UpgradeModal', () => {
	it('renders lock icon', async () => {
		const { container } = render(UpgradeModal, { onDismiss: vi.fn() });
		const lockIcon = container.querySelector('.fa-lock');
		expect(lockIcon).not.toBeNull();
	});

	it('renders Pro star badge icon', async () => {
		const { container } = render(UpgradeModal, { onDismiss: vi.fn() });
		const starIcon = container.querySelector('.fa-star');
		expect(starIcon).not.toBeNull();
	});

	it('renders title "Reports are a Pro feature"', async () => {
		render(UpgradeModal, { onDismiss: vi.fn() });
		await expect.element(page.getByText('Reports are a Pro feature')).toBeInTheDocument();
	});

	it('renders description text', async () => {
		render(UpgradeModal, { onDismiss: vi.fn() });
		await expect
			.element(page.getByText(/Get access to your cleaning history/))
			.toBeInTheDocument();
	});

	it('renders upgrade CTA button "Upgrade to Pro"', async () => {
		render(UpgradeModal, { onDismiss: vi.fn() });
		await expect.element(page.getByRole('button', { name: 'Upgrade to Pro' })).toBeInTheDocument();
	});

	it('renders dismiss button "Continue for free"', async () => {
		render(UpgradeModal, { onDismiss: vi.fn() });
		await expect
			.element(page.getByRole('button', { name: 'Continue for free' }))
			.toBeInTheDocument();
	});

	it('clicking dismiss calls onDismiss callback', async () => {
		const onDismiss = vi.fn();
		render(UpgradeModal, { onDismiss });
		const dismissBtn = page.getByRole('button', { name: 'Continue for free' });
		await dismissBtn.click();
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it('does not call onDismiss when upgrade CTA is clicked', async () => {
		const onDismiss = vi.fn();
		render(UpgradeModal, { onDismiss });
		const upgradeBtn = page.getByRole('button', { name: 'Upgrade to Pro' });
		await upgradeBtn.click();
		expect(onDismiss).not.toHaveBeenCalled();
	});

	it('renders feature highlight for cleaning history', async () => {
		render(UpgradeModal, { onDismiss: vi.fn() });
		await expect.element(page.getByText('30-day cleaning history')).toBeInTheDocument();
	});

	it('renders feature highlight for PDF reports', async () => {
		const { container } = render(UpgradeModal, { onDismiss: vi.fn() });
		expect(container.textContent).toContain('Downloadable PDF reports');
	});
});

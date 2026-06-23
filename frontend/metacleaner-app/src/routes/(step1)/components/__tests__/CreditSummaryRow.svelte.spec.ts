import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CreditSummaryRow from '../CreditSummaryRow.svelte';

vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

describe('CreditSummaryRow', () => {
	it('renders totalCost value', async () => {
		render(CreditSummaryRow, { totalCost: 3, fileCount: 3, creditBalance: 10 });
		// Use exact: true to avoid matching "3" inside the "Cleaning cost for 3 files" span
		await expect.element(page.getByText('3', { exact: true })).toBeInTheDocument();
	});

	it('renders bolt icon', async () => {
		const { container } = render(CreditSummaryRow, {
			totalCost: 1,
			fileCount: 1,
			creditBalance: 5
		});
		const bolt = container.querySelector('.fa-bolt');
		expect(bolt).not.toBeNull();
	});

	it('renders info icon', async () => {
		const { container } = render(CreditSummaryRow, {
			totalCost: 1,
			fileCount: 1,
			creditBalance: 5
		});
		const infoIcon = container.querySelector('.fa-circle-info');
		expect(infoIcon).not.toBeNull();
	});

	it('applies warning (orange) styling when totalCost exceeds creditBalance', async () => {
		const { container } = render(CreditSummaryRow, {
			totalCost: 5,
			fileCount: 5,
			creditBalance: 2
		});
		const outerDiv = container.querySelector('.border-orange-500\\/40');
		expect(outerDiv).not.toBeNull();
	});

	it('shows insufficient credits message when totalCost exceeds creditBalance', async () => {
		render(CreditSummaryRow, { totalCost: 5, fileCount: 5, creditBalance: 2 });
		await expect.element(page.getByText('Not enough credits.')).toBeInTheDocument();
	});

	it('shows upgrade plan link when insufficient credits', async () => {
		render(CreditSummaryRow, { totalCost: 5, fileCount: 5, creditBalance: 2 });
		await expect.element(page.getByText('Upgrade plan')).toBeInTheDocument();
	});

	it('does not show insufficient message when credits are sufficient', async () => {
		const { container } = render(CreditSummaryRow, {
			totalCost: 2,
			fileCount: 2,
			creditBalance: 10
		});
		const exclamation = container.querySelector('.fa-triangle-exclamation');
		expect(exclamation).toBeNull();
	});

	it('uses neutral (gray) border when creditBalance is null', async () => {
		const { container } = render(CreditSummaryRow, {
			totalCost: 3,
			fileCount: 3,
			creditBalance: null
		});
		const outerDiv = container.querySelector('.border-gray-700');
		expect(outerDiv).not.toBeNull();
	});

	it('does not show insufficient message when creditBalance is null', async () => {
		const { container } = render(CreditSummaryRow, {
			totalCost: 99,
			fileCount: 99,
			creditBalance: null
		});
		const exclamation = container.querySelector('.fa-triangle-exclamation');
		expect(exclamation).toBeNull();
	});

	it('uses green badge styling when credits are sufficient', async () => {
		const { container } = render(CreditSummaryRow, {
			totalCost: 2,
			fileCount: 2,
			creditBalance: 10
		});
		const badge = container.querySelector('.border-brand-green\\/30');
		expect(badge).not.toBeNull();
	});
});

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProOverlay from '../ProOverlay.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

describe('ProOverlay', () => {
	it('renders lock icon', async () => {
		const { container } = render(ProOverlay, {});
		const lockIcon = container.querySelector('.fa-lock');
		expect(lockIcon).not.toBeNull();
	});

	it('renders Pro star badge icon', async () => {
		const { container } = render(ProOverlay, {});
		const starIcon = container.querySelector('.fa-star');
		expect(starIcon).not.toBeNull();
	});

	it('renders title "Risk Scanner"', async () => {
		render(ProOverlay, {});
		await expect.element(page.getByRole('heading', { name: 'Risk Scanner' })).toBeInTheDocument();
	});

	it('renders PRO badge', async () => {
		render(ProOverlay, {});
		// Use exact: true to avoid matching "Pro" inside button text "Unlock Pro plan"
		await expect.element(page.getByText('PRO', { exact: true })).toBeInTheDocument();
	});

	it('renders description text', async () => {
		render(ProOverlay, {});
		await expect.element(page.getByText(/Unlock Risk Scanner/)).toBeInTheDocument();
	});

	it('renders GPS detection chip', async () => {
		render(ProOverlay, {});
		await expect.element(page.getByText('GPS detection')).toBeInTheDocument();
	});

	it('renders Identity chip', async () => {
		render(ProOverlay, {});
		// Use exact: true to avoid matching "identity" inside the description paragraph
		await expect.element(page.getByText('Identity', { exact: true })).toBeInTheDocument();
	});

	it('renders Risk score chip', async () => {
		render(ProOverlay, {});
		await expect.element(page.getByText('Risk score')).toBeInTheDocument();
	});

	it('renders CTA button "Unlock Pro plan"', async () => {
		render(ProOverlay, {});
		await expect.element(page.getByRole('button', { name: 'Unlock Pro plan' })).toBeInTheDocument();
	});

	it('renders price hint text', async () => {
		render(ProOverlay, {});
		await expect.element(page.getByText(/From €5\.99\/month/)).toBeInTheDocument();
	});

	it('renders gradient background (from transparent to navy)', async () => {
		const { container } = render(ProOverlay, {});
		const overlay = container.querySelector('.bg-gradient-to-b');
		expect(overlay).not.toBeNull();
	});

	it('renders chip icons with location-dot for GPS chip', async () => {
		const { container } = render(ProOverlay, {});
		const locationIcon = container.querySelector('.fa-location-dot');
		expect(locationIcon).not.toBeNull();
	});
});

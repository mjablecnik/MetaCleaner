import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EndpointCard from '../components/EndpointCard.svelte';
import { getEndpoints } from '$lib/repositories/docsRepository';

const endpoints = getEndpoints();
const fullEndpoint = endpoints.find((e) => !e.isMinimal)!;

// ─── EndpointCard ─────────────────────────────────────────────────────────────

describe('EndpointCard', () => {
	it('renders the HTTP method badge', async () => {
		render(EndpointCard, { endpoint: fullEndpoint });
		await expect.element(page.getByText(fullEndpoint.method)).toBeInTheDocument();
	});

	it('renders the endpoint path', async () => {
		render(EndpointCard, { endpoint: fullEndpoint });
		await expect.element(page.getByText(fullEndpoint.path)).toBeInTheDocument();
	});

	it('is collapsed by default (no expanded content visible)', async () => {
		const { container } = render(EndpointCard, { endpoint: fullEndpoint });
		const paramsTable = container.querySelector('table');
		expect(paramsTable).toBeNull();
	});

	it('expands on click to reveal params table', async () => {
		const { container } = render(EndpointCard, { endpoint: fullEndpoint });
		const header = container.querySelector('button') as HTMLButtonElement;
		header.click();
		// After state update, table should appear
		await expect.element(page.getByRole('table').first()).toBeInTheDocument();
	});

	it('shows cURL example when expanded', async () => {
		render(EndpointCard, { endpoint: fullEndpoint, initialOpen: true });
		await expect
			.element(page.getByText(/api\.metacleaner\.com/, { exact: false }).first())
			.toBeInTheDocument();
	});

	it('collapses when clicked again', async () => {
		render(EndpointCard, { endpoint: fullEndpoint });
		const btn = page.getByRole('button').first();
		await btn.click();
		await expect.element(page.getByRole('table').first()).toBeInTheDocument();
		await btn.click();
		await expect.element(page.getByRole('table').first()).not.toBeInTheDocument();
	});

	it('applies brand-blue border class when expanded', async () => {
		const { container } = render(EndpointCard, { endpoint: fullEndpoint });
		const header = container.querySelector('button') as HTMLButtonElement;
		header.click();
		await expect.element(page.getByRole('table').first()).toBeInTheDocument();
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.className).toContain('border-brand-blue');
	});

	it('applies gray-800 border class when collapsed', async () => {
		const { container } = render(EndpointCard, { endpoint: fullEndpoint });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.className).toContain('border-gray-800');
	});

	it('starts open when initialOpen is true', async () => {
		render(EndpointCard, { endpoint: fullEndpoint, initialOpen: true });
		await expect.element(page.getByRole('table').first()).toBeInTheDocument();
	});

	it('shows CopyButton(s) inside each expanded CodeBlock', async () => {
		const { container } = render(EndpointCard, { endpoint: fullEndpoint, initialOpen: true });
		await expect.element(page.getByRole('table').first()).toBeInTheDocument();
		const copyBtns = container.querySelectorAll('button[aria-label="Copy to clipboard"]');
		expect(copyBtns.length).toBeGreaterThan(0);
	});
});


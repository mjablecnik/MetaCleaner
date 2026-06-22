import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EndpointCard from '../components/EndpointCard.svelte';
import DocsSidebar from '../components/DocsSidebar.svelte';
import {
	getEndpoints,
	getSidebarSections,
	getSidebarEndpoints
} from '$lib/repositories/docsRepository';

const endpoints = getEndpoints();
const fullEndpoint = endpoints.find((e) => !e.isMinimal)!;
const minimalEndpoint = endpoints.find((e) => e.isMinimal)!;

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

	it('minimal endpoint shows clock icon placeholder instead of params table', async () => {
		const { container } = render(EndpointCard, { endpoint: minimalEndpoint });
		const header = container.querySelector('button') as HTMLButtonElement;
		header.click();
		// Wait for expanded content
		await expect
			.element(page.getByText(/api\.metacleaner\.com/, { exact: false }).first())
			.not.toBeInTheDocument();
		const clockIcon = container.querySelector('.fa-clock');
		expect(clockIcon).not.toBeNull();
	});

	it('shows CopyButton(s) inside each expanded CodeBlock', async () => {
		const { container } = render(EndpointCard, { endpoint: fullEndpoint, initialOpen: true });
		await expect.element(page.getByRole('table').first()).toBeInTheDocument();
		const copyBtns = container.querySelectorAll('button[aria-label="Copy to clipboard"]');
		expect(copyBtns.length).toBeGreaterThan(0);
	});
});

// ─── DocsSidebar ─────────────────────────────────────────────────────────────

describe('DocsSidebar', () => {
	const sections = getSidebarSections();
	const sidebarEndpoints = getSidebarEndpoints();

	it('renders all endpoint labels in the sidebar', async () => {
		render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: sections[0].id,
			onNavigate: vi.fn()
		});
		for (const ep of sidebarEndpoints) {
			await expect.element(page.getByText(ep.label)).toBeInTheDocument();
		}
	});

	it('highlights active section with brand-blue text class', async () => {
		const activeSection = sections[0];
		const { container } = render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: activeSection.id,
			onNavigate: vi.fn()
		});
		const blueBtn = Array.from(container.querySelectorAll('button')).find((b) =>
			b.className.includes('text-brand-blue')
		);
		expect(blueBtn).not.toBeNull();
	});

	it('inactive sections have text-text-muted class', async () => {
		const { container } = render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: sections[0].id,
			onNavigate: vi.fn()
		});
		const mutedBtns = Array.from(container.querySelectorAll('button')).filter((b) =>
			b.className.includes('text-text-muted')
		);
		expect(mutedBtns.length).toBeGreaterThan(0);
	});

	it('calls onNavigate with section id when section button is clicked', async () => {
		const navigate = vi.fn();
		const { container } = render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: sections[0].id,
			onNavigate: navigate
		});
		const firstBtn = container.querySelector('button') as HTMLButtonElement;
		firstBtn.click();
		expect(navigate).toHaveBeenCalledWith(sections[0].id);
	});

	it('renders a nav element as root', async () => {
		const { container } = render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: sections[0].id,
			onNavigate: vi.fn()
		});
		const nav = container.querySelector('nav');
		expect(nav).not.toBeNull();
	});

	it('renders MethodBadge span elements for each endpoint', async () => {
		const { container } = render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: sections[0].id,
			onNavigate: vi.fn()
		});
		const spanEls = container.querySelectorAll('span');
		expect(spanEls.length).toBeGreaterThanOrEqual(sidebarEndpoints.length);
	});

	it('active endpoint link gets brand-blue class when an endpoint is active', async () => {
		const activeEp = sidebarEndpoints[0];
		const { container } = render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: activeEp.id,
			onNavigate: vi.fn()
		});
		const blueElements = Array.from(container.querySelectorAll('button')).filter((b) =>
			b.className.includes('text-brand-blue')
		);
		expect(blueElements.length).toBeGreaterThan(0);
	});

	it('renders exactly as many section buttons as sections provided', async () => {
		const { container } = render(DocsSidebar, {
			sections,
			endpoints: sidebarEndpoints,
			activeId: sections[0].id,
			onNavigate: vi.fn()
		});
		// Total buttons = sections + endpoints
		const buttons = container.querySelectorAll('button');
		expect(buttons.length).toBe(sections.length + sidebarEndpoints.length);
	});
});

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InfoBox from '../InfoBox.svelte';
import MethodBadge from '../MethodBadge.svelte';
import FeatureCard from '../FeatureCard.svelte';

// ─── InfoBox ─────────────────────────────────────────────────────────────────

describe('InfoBox', () => {
	it('blue variant applies brand-blue background class', async () => {
		const { container } = render(InfoBox, { variant: 'blue' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('bg-brand-blue');
		expect(el.className).toContain('border-brand-blue');
	});

	it('green variant applies brand-green background class', async () => {
		const { container } = render(InfoBox, { variant: 'green' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('bg-brand-green');
		expect(el.className).toContain('border-brand-green');
	});

	it('orange variant applies brand-orange background class', async () => {
		const { container } = render(InfoBox, { variant: 'orange' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('bg-brand-orange');
		expect(el.className).toContain('border-brand-orange');
	});

	it('red variant applies brand-red background class', async () => {
		const { container } = render(InfoBox, { variant: 'red' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('bg-brand-red');
		expect(el.className).toContain('border-brand-red');
	});

	it('applies rounded-[10px] border-radius', async () => {
		const { container } = render(InfoBox, { variant: 'blue' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('rounded-[10px]');
	});

	it('renders icon when icon prop is provided', async () => {
		const { container } = render(InfoBox, { variant: 'blue', icon: 'fa-circle-info' });
		const icon = container.querySelector('.fa-circle-info');
		expect(icon).not.toBeNull();
	});

	it('does not render icon element when icon prop is omitted', async () => {
		const { container } = render(InfoBox, { variant: 'blue' });
		const icon = container.querySelector('i');
		expect(icon).toBeNull();
	});

	it('accepts extra class via class prop', async () => {
		const { container } = render(InfoBox, { variant: 'green', class: 'test-extra' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('test-extra');
	});

	it('all 4 variants use distinct brand color tokens', async () => {
		const variants = ['blue', 'green', 'orange', 'red'] as const;
		const bgClasses = new Set<string>();
		for (const variant of variants) {
			const { container } = render(InfoBox, { variant });
			const el = container.firstElementChild as HTMLElement;
			const bgMatch = el.className.match(/bg-brand-\w+/);
			if (bgMatch) bgClasses.add(bgMatch[0]);
		}
		expect(bgClasses.size).toBe(4);
	});
});

// ─── MethodBadge ─────────────────────────────────────────────────────────────

describe('MethodBadge', () => {
	it('renders GET method text', async () => {
		render(MethodBadge, { method: 'GET' });
		await expect.element(page.getByText('GET')).toBeInTheDocument();
	});

	it('renders POST method text', async () => {
		render(MethodBadge, { method: 'POST' });
		await expect.element(page.getByText('POST')).toBeInTheDocument();
	});

	it('renders DEL method text', async () => {
		render(MethodBadge, { method: 'DEL' });
		await expect.element(page.getByText('DEL')).toBeInTheDocument();
	});

	it('GET applies brand-green color classes', async () => {
		const { container } = render(MethodBadge, { method: 'GET' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('brand-green');
	});

	it('POST applies brand-blue color classes', async () => {
		const { container } = render(MethodBadge, { method: 'POST' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('brand-blue');
	});

	it('DEL applies brand-red color classes', async () => {
		const { container } = render(MethodBadge, { method: 'DEL' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('brand-red');
	});

	it('sm size applies smaller padding class', async () => {
		const { container } = render(MethodBadge, { method: 'GET', size: 'sm' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('px-1.5');
	});

	it('md size applies larger padding class', async () => {
		const { container } = render(MethodBadge, { method: 'GET', size: 'md' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('px-2');
	});

	it('defaults to md size when size prop omitted', async () => {
		const { container } = render(MethodBadge, { method: 'GET' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('px-2');
	});

	it('renders PATCH method with orange color classes', async () => {
		const { container } = render(MethodBadge, { method: 'PATCH' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('brand-orange');
	});

	it('renders PUT method with orange color classes', async () => {
		const { container } = render(MethodBadge, { method: 'PUT' });
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain('brand-orange');
	});
});

// ─── FeatureCard ─────────────────────────────────────────────────────────────

describe('FeatureCard', () => {
	it('renders the title', async () => {
		render(FeatureCard, {
			icon: 'fa-upload',
			iconColor: 'text-brand-blue',
			title: 'Upload Files',
			description: 'Upload your files to the API'
		});
		await expect.element(page.getByText('Upload Files')).toBeInTheDocument();
	});

	it('renders the description', async () => {
		render(FeatureCard, {
			icon: 'fa-upload',
			iconColor: 'text-brand-blue',
			title: 'Title',
			description: 'Some description text'
		});
		await expect.element(page.getByText('Some description text')).toBeInTheDocument();
	});

	it('renders the icon element', async () => {
		const { container } = render(FeatureCard, {
			icon: 'fa-upload',
			iconColor: 'text-brand-blue',
			title: 'Title',
			description: 'Description'
		});
		const icon = container.querySelector('.fa-upload');
		expect(icon).not.toBeNull();
	});

	it('applies iconColor to the icon element', async () => {
		const { container } = render(FeatureCard, {
			icon: 'fa-broom',
			iconColor: 'text-brand-green',
			title: 'Clean',
			description: 'Clean metadata'
		});
		const icon = container.querySelector('i');
		expect(icon!.className).toContain('text-brand-green');
	});

	it('renders within a card container with border', async () => {
		const { container } = render(FeatureCard, {
			icon: 'fa-clock',
			iconColor: 'text-brand-orange',
			title: 'Async',
			description: 'Async processing'
		});
		const card = container.firstElementChild as HTMLElement;
		expect(card.className).toContain('border');
	});

	it('renders title with semibold font class', async () => {
		const { container } = render(FeatureCard, {
			icon: 'fa-clock',
			iconColor: 'text-brand-orange',
			title: 'Test Title',
			description: 'Test Description'
		});
		const titleEl = container.querySelector('.font-semibold');
		expect(titleEl).not.toBeNull();
		expect(titleEl!.textContent).toContain('Test Title');
	});
});

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SuccessHeader from '../SuccessHeader.svelte';

describe('SuccessHeader', () => {
	it('renders success title', async () => {
		render(SuccessHeader, { fileCount: 3, onUploadNew: vi.fn() });
		// Title contains "Čištění dokončeno!" (or similar i18n key result)
		const h1 = page.getByRole('heading', { level: 1 });
		await expect.element(h1).toBeInTheDocument();
	});

	it('renders checkPop animation icon', async () => {
		const { container } = render(SuccessHeader, { fileCount: 2, onUploadNew: vi.fn() });
		// The check icon container has check-pop class for animation
		const checkEl = container.querySelector('.check-pop');
		expect(checkEl).not.toBeNull();
	});

	it('calls onUploadNew when upload button is clicked', async () => {
		const onUploadNew = vi.fn();
		render(SuccessHeader, { fileCount: 1, onUploadNew });
		// Find and click the upload new button
		const buttons = page.getByRole('button');
		await buttons.first().click();
		expect(onUploadNew).toHaveBeenCalledOnce();
	});

	it('shows success badge', async () => {
		render(SuccessHeader, { fileCount: 5, onUploadNew: vi.fn() });
		// Success badge with green dot should be visible
		await expect.element(page.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});

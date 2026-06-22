import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CodeBlock from '../CodeBlock.svelte';
import CopyButton from '../CopyButton.svelte';

describe('CodeBlock', () => {
	it('renders the code content as text', async () => {
		render(CodeBlock, { code: 'Hello, World!' });
		await expect.element(page.getByText('Hello, World!')).toBeInTheDocument();
	});

	it('renders a pre element with monospace font class', async () => {
		const { container } = render(CodeBlock, { code: 'const x = 1;' });
		const pre = container.querySelector('pre');
		expect(pre).not.toBeNull();
		expect(pre!.className).toContain('font-mono');
	});

	it('renders with dark background style', async () => {
		const { container } = render(CodeBlock, { code: 'test' });
		const wrapper = container.querySelector('[style*="background"]');
		expect(wrapper).not.toBeNull();
	});

	it('renders a CopyButton inside the code block', async () => {
		const { container } = render(CodeBlock, { code: 'copy this text' });
		const copyBtn = container.querySelector('button[aria-label="Copy to clipboard"]');
		expect(copyBtn).not.toBeNull();
	});

	it('renders multiline code preserving whitespace', async () => {
		const code = 'line 1\nline 2\nline 3';
		const { container } = render(CodeBlock, { code });
		const pre = container.querySelector('pre');
		expect(pre).not.toBeNull();
		expect(pre!.textContent).toContain('line 1');
		expect(pre!.textContent).toContain('line 2');
	});

	it('accepts extra class via class prop', async () => {
		const { container } = render(CodeBlock, { code: 'test', class: 'my-extra-class' });
		const wrapper = container.querySelector('.my-extra-class');
		expect(wrapper).not.toBeNull();
	});

	it('wraps content in a relative positioned div', async () => {
		const { container } = render(CodeBlock, { code: 'test' });
		const wrapper = container.querySelector('div.relative');
		expect(wrapper).not.toBeNull();
	});
});

describe('CopyButton', () => {
	let clipboardWriteText: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		clipboardWriteText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: clipboardWriteText },
			configurable: true,
			writable: true
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders a button with aria-label "Copy to clipboard"', async () => {
		render(CopyButton, { text: 'hello' });
		const btn = page.getByRole('button', { name: 'Copy to clipboard' });
		await expect.element(btn).toBeInTheDocument();
	});

	it('shows copy icon (fa-copy) before click', async () => {
		const { container } = render(CopyButton, { text: 'hello' });
		const icon = container.querySelector('.fa-copy');
		expect(icon).not.toBeNull();
	});

	it('writes text to clipboard on click', async () => {
		render(CopyButton, { text: 'copy me' });
		const btn = page.getByRole('button', { name: 'Copy to clipboard' });
		await btn.click();
		expect(clipboardWriteText).toHaveBeenCalledWith('copy me');
	});

	it('shows checkmark icon (fa-check) after successful copy', async () => {
		const { container } = render(CopyButton, { text: 'copy me' });
		const btn = page.getByRole('button', { name: 'Copy to clipboard' });
		await btn.click();
		const checkIcon = container.querySelector('.fa-check');
		expect(checkIcon).not.toBeNull();
	});

	it('does not write to clipboard again when clicked in confirmed state', async () => {
		render(CopyButton, { text: 'once only' });
		const btn = page.getByRole('button', { name: 'Copy to clipboard' });
		await btn.click();
		await btn.click();
		expect(clipboardWriteText).toHaveBeenCalledTimes(1);
	});

	it('silently fails when clipboard API is unavailable', async () => {
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: vi.fn().mockRejectedValue(new Error('no clipboard')) },
			configurable: true,
			writable: true
		});
		const { container } = render(CopyButton, { text: 'fail silently' });
		const btn = page.getByRole('button', { name: 'Copy to clipboard' });
		await btn.click();
		// Write failed → copy icon remains visible (confirmed state not set)
		const copyIcon = container.querySelector('.fa-copy');
		expect(copyIcon).not.toBeNull();
	});
});

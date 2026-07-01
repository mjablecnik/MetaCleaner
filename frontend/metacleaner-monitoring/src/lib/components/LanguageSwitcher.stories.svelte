<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	const { Story } = defineMeta({
		title: 'Components/LanguageSwitcher',
		component: LanguageSwitcher,
		tags: ['autodocs']
	});
</script>

<Story
	name="EnActive"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const enBtn = canvas.getByRole('button', { name: 'EN' });
		await userEvent.click(enBtn);
		await expect(enBtn).toHaveAttribute('aria-pressed', 'true');
		await expect(canvas.getByRole('button', { name: 'CS' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	}}
/>

<Story
	name="CsActive"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const csBtn = canvas.getByRole('button', { name: 'CS' });
		await userEvent.click(csBtn);
		await expect(csBtn).toHaveAttribute('aria-pressed', 'true');
		await expect(canvas.getByRole('button', { name: 'EN' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	}}
/>

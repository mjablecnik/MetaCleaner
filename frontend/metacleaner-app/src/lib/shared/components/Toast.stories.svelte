<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Toast from './Toast.svelte';

	const { Story } = defineMeta({
		title: 'Components/Toast',
		component: Toast,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			},
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Visible">
	<div style="min-height: 200px; position: relative;">
		<Toast message="Report downloaded successfully" show={true} />
	</div>
</Story>

<Story name="Hidden">
	<div
		style="min-height: 200px; position: relative; display: flex; align-items: center; justify-content: center;"
	>
		<span style="color: #94a3b8; font-size: 0.875rem;"
			>Toast is hidden (show=false) — nothing rendered</span
		>
		<Toast message="Report downloaded successfully" show={false} />
	</div>
</Story>

<Story name="With Custom Icon">
	<div style="min-height: 200px; position: relative;">
		<Toast message="File exported as ZIP" show={true} icon="fa-solid fa-file-zipper" />
	</div>
</Story>

<Story name="Error Icon">
	<div style="min-height: 200px; position: relative;">
		<Toast
			message="Download failed. Please try again."
			show={true}
			icon="fa-solid fa-circle-xmark"
		/>
	</div>
</Story>

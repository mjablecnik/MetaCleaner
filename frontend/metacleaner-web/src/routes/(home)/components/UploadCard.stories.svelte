<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UploadCard from './UploadCard.svelte';

	const { Story } = defineMeta({
		title: 'Home/UploadCard',
		component: UploadCard,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'select' }, options: ['desktop', 'mobile'] }
		},
		args: {
			size: 'desktop'
		}
	});
</script>

<!-- Desktop: fixed-height wrapper replicates the hero column context -->
<Story name="Desktop">
	<div class="w-full h-[400px]">
		<UploadCard size="desktop" />
	</div>
</Story>

<!-- Mobile: sized by content -->
<Story name="Mobile" args={{ size: 'mobile' }} />

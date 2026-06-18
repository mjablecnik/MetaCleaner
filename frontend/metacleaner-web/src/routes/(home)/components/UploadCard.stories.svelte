<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import UploadCard from './UploadCard.svelte';

	const { Story } = defineMeta({
		title: 'Home/UploadCard',
		component: UploadCard,
		tags: ['autodocs']
	});
</script>

<!-- Desktop: fixed-height wrapper replicates the hero column context -->
<Story name="Desktop">
	<div class="w-full h-[400px]">
		<UploadCard />
	</div>
</Story>

<!-- Mobile: sized by content -->
<Story name="Mobile">
	<div class="w-[375px]">
		<UploadCard />
	</div>
</Story>

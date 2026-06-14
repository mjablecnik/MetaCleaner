<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MobileStatusCard from './MobileStatusCard.svelte';

	const { Story } = defineMeta({
		title: 'Step3/MobileStatusCard',
		component: MobileStatusCard,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			},
			viewport: { defaultViewport: 'mobile1' }
		}
	});
</script>

<Story name="In Progress">
	<div class="w-full max-w-sm p-4">
		<MobileStatusCard
			currentFileName="vacation_beach.heic"
			totalFiles={5}
			fieldsRemoved={23}
			filesCompleted={2}
		/>
	</div>
</Story>

<Story name="Near Completion">
	<div class="w-full max-w-sm p-4">
		<MobileStatusCard
			currentFileName="walk_prague.mp4"
			totalFiles={5}
			fieldsRemoved={64}
			filesCompleted={4}
		/>
	</div>
</Story>

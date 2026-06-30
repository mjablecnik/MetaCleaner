<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DangerZoneSection from './DangerZoneSection.svelte';

	const { Story } = defineMeta({
		title: 'Settings/Sections/DangerZoneSection',
		component: DangerZoneSection,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Default">
	<div class="w-full max-w-lg">
		<DangerZoneSection />
	</div>
</Story>

<Story name="Collapsible">
	<div class="w-full max-w-lg">
		<DangerZoneSection collapsible={true} />
	</div>
</Story>

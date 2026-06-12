<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TrustBadges from './TrustBadges.svelte';

	const { Story } = defineMeta({
		title: 'Auth/TrustBadges',
		component: TrustBadges,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: 'var(--color-navy-main)' }]
			}
		}
	});
</script>

<Story name="Default">
	<div class="p-4">
		<TrustBadges />
	</div>
</Story>

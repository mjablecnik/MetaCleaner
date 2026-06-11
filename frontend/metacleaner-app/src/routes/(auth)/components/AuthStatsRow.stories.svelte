<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthStatsRow from './AuthStatsRow.svelte';

	const { Story } = defineMeta({
		title: 'Auth/AuthStatsRow',
		component: AuthStatsRow,
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
	<div class="w-80 p-4">
		<AuthStatsRow
			stats={[
				{ value: '50K+', labelKey: 'auth.common.stats.usersLabel' },
				{ value: '2M+', labelKey: 'auth.common.stats.filesCleanedLabel' },
				{ value: '100%', labelKey: 'auth.common.stats.securityLabel' }
			]}
		/>
	</div>
</Story>

<Story name="Bordered">
	<div class="w-80 p-4">
		<AuthStatsRow
			bordered
			stats={[
				{ value: '50K+', labelKey: 'auth.common.stats.usersLabel' },
				{ value: '2M+', labelKey: 'auth.common.stats.filesCleanedLabel' },
				{ value: '100%', labelKey: 'auth.common.stats.securityLabel' }
			]}
		/>
	</div>
</Story>

<Story name="CustomValues">
	<div class="w-80 p-4">
		<AuthStatsRow
			stats={[
				{ value: '10K+', labelKey: 'auth.common.stats.usersLabel' },
				{ value: '500K+', labelKey: 'auth.common.stats.filesCleanedLabel' },
				{ value: '99.9%', labelKey: 'auth.common.stats.securityLabel' }
			]}
		/>
	</div>
</Story>

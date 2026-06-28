<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './PageHeader.svelte';

	const { Story } = defineMeta({
		title: 'Components/PageHeader',
		component: PageHeader,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<PageHeader titleKey="dashboard_header_title" subtitleKey="dashboard_header_subtitle" />
</Story>

<Story name="WithStatusBadge">
	<PageHeader titleKey="availability_header_title" subtitleKey="availability_header_subtitle">
		{#snippet statusBadge()}
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
			>
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				All Systems Operational
			</div>
		{/snippet}
	</PageHeader>
</Story>

<Story name="WithActions">
	<PageHeader titleKey="errors_header_title" subtitleKey="errors_header_subtitle">
		{#snippet statusBadge()}
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium"
			>
				<div class="w-2 h-2 rounded-full bg-error animate-pulse"></div>
				3 Active Incidents
			</div>
		{/snippet}
		{#snippet actions()}
			<select
				class="bg-surface border border-border text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none"
			>
				<option>Last 24h</option>
				<option>Last 7d</option>
				<option>Last 30d</option>
			</select>
			<button
				class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border"
			>
				<i class="fa-solid fa-download mr-2"></i>Export
			</button>
		{/snippet}
	</PageHeader>
</Story>

<Story name="WithIcon">
	<PageHeader
		titleKey="layout_nav_performance"
		subtitleKey="performance_header_subtitle"
		icon="fa-bolt"
		iconContainerClass="bg-amber/15 border border-amber/30"
		iconClass="text-amber text-sm"
	>
		{#snippet statusBadge()}
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
			>
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				System OK
			</div>
		{/snippet}
	</PageHeader>
</Story>

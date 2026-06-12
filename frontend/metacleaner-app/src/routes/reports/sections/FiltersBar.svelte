<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import FilterPill from '../components/FilterPill.svelte';

	interface Props {
		activeFilter: string;
		searchQuery?: string;
		onFilterChange: (filter: string) => void;
	}

	let { activeFilter, searchQuery = $bindable(''), onFilterChange }: Props = $props();

</script>

<div
	class="fade-in-up hidden rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card delay-2 lg:block"
>
	<div class="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
		<div class="flex flex-wrap items-center gap-2">
			<span class="mr-1 text-xs font-semibold tracking-wider text-text-muted uppercase">
				{tx('reports.filter.label')}
			</span>
			<FilterPill
				label={tx('reports.filter.all')}
				active={activeFilter === 'all'}
				onclick={() => onFilterChange('all')}
			/>
			<FilterPill
				label={tx('reports.filter.successful')}
				icon="fa-solid fa-circle-check text-brand-green"
				active={activeFilter === 'success'}
				onclick={() => onFilterChange('success')}
			/>
			<FilterPill
				label={tx('reports.filter.containedGps')}
				icon="fa-solid fa-location-dot text-brand-red"
				active={activeFilter === 'gps'}
				onclick={() => onFilterChange('gps')}
			/>
			<FilterPill
				label={tx('reports.filter.photos')}
				icon="fa-solid fa-image text-brand-blue"
				active={activeFilter === 'image'}
				onclick={() => onFilterChange('image')}
			/>
			<FilterPill
				label={tx('reports.filter.video')}
				icon="fa-solid fa-video text-brand-orange"
				active={activeFilter === 'video'}
				onclick={() => onFilterChange('video')}
			/>
		</div>
		<div class="relative w-full md:w-64">
			<i
				class="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-xs text-text-muted"
			></i>
			<input
				bind:value={searchQuery}
				type="text"
				placeholder={tx('reports.search.placeholder')}
				class="w-full rounded-lg border border-gray-700 bg-navy-main py-2 pr-4 pl-8 text-sm text-white placeholder-text-muted transition-colors focus:border-brand-blue focus:outline-none"
			/>
		</div>
	</div>
</div>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import FilterPill from '../components/FilterPill.svelte';

	interface Props {
		activeFilter: string;
		searchQuery?: string;
		onFilterChange: (filter: string) => void;
	}

	let { activeFilter, searchQuery = $bindable(''), onFilterChange }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="fade-in-up delay-2 hidden lg:block bg-navy-card rounded-2xl border border-gray-800 p-4 shadow-card">
	<div class="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
		<div class="flex items-center gap-2 flex-wrap">
			<span class="text-xs text-text-muted font-semibold uppercase tracking-wider mr-1">
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
			<i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
			<input
				bind:value={searchQuery}
				type="text"
				placeholder={tx('reports.search.placeholder')}
				class="w-full pl-8 pr-4 py-2 rounded-lg bg-navy-main border border-gray-700 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue transition-colors"
			/>
		</div>
	</div>
</div>

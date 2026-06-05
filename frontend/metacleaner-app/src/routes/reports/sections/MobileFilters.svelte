<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import FilterPill from '../components/FilterPill.svelte';

	interface Props {
		activeFilter: string;
		searchQuery?: string;
		onFilterChange: (filter: string) => void;
	}

	let { activeFilter, searchQuery = $bindable(''), onFilterChange }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<!-- Search — Mobile -->
<div class="fade-in-up delay-2 lg:hidden relative">
	<i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"></i>
	<input
		bind:value={searchQuery}
		type="text"
		placeholder={tx('reports.search.placeholder')}
		class="w-full pl-9 pr-4 py-3 rounded-xl bg-navy-card border border-gray-700 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-blue transition-colors"
	/>
</div>

<!-- Filter pills — Mobile scrollable -->
<div class="fade-in-up delay-2 lg:hidden">
	<div class="filters-scroll">
		<FilterPill
			label={tx('reports.filter.all')}
			active={activeFilter === 'all'}
			class="py-2"
			onclick={() => onFilterChange('all')}
		/>
		<FilterPill
			label={tx('reports.filter.successful')}
			icon="fa-solid fa-circle-check text-brand-green"
			active={activeFilter === 'success'}
			class="py-2"
			onclick={() => onFilterChange('success')}
		/>
		<FilterPill
			label={tx('reports.filter.containedGpsShort')}
			icon="fa-solid fa-location-dot text-brand-red"
			active={activeFilter === 'gps'}
			class="py-2"
			onclick={() => onFilterChange('gps')}
		/>
		<FilterPill
			label={tx('reports.filter.photosShort')}
			icon="fa-solid fa-image text-brand-blue"
			active={activeFilter === 'image'}
			class="py-2"
			onclick={() => onFilterChange('image')}
		/>
		<FilterPill
			label={tx('reports.filter.video')}
			icon="fa-solid fa-video text-brand-orange"
			active={activeFilter === 'video'}
			class="py-2"
			onclick={() => onFilterChange('video')}
		/>
	</div>
</div>

<style>
	.filters-scroll {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 2px;
	}
	.filters-scroll::-webkit-scrollbar {
		display: none;
	}
</style>

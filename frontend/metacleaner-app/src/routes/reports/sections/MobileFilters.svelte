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
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<!-- Search — Mobile -->
<div class="fade-in-up relative delay-2 lg:hidden">
	<i
		class="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-xs text-text-muted"
	></i>
	<input
		bind:value={searchQuery}
		type="text"
		placeholder={tx('reports.search.placeholder')}
		class="w-full rounded-xl border border-gray-700 bg-navy-card py-3 pr-4 pl-9 text-sm text-white placeholder-text-muted transition-colors focus:border-brand-blue focus:outline-none"
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

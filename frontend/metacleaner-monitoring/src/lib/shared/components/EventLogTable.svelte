<script lang="ts">
	import type { Snippet } from 'svelte';
	import DataTable from '$lib/shared/elements/DataTable.svelte';

	interface Filter {
		label: string;
		value: string;
	}

	interface Props {
		title?: string;
		subtitle?: string;
		filters?: Filter[];
		activeFilter?: string;
		onfilterchange?: (value: string) => void;
		filterActiveClass?: string;
		searchPlaceholder?: string;
		headers: string[];
		children: Snippet;
	}

	let {
		title,
		subtitle,
		filters = [],
		activeFilter = '',
		onfilterchange,
		filterActiveClass = 'bg-error/20 text-error',
		searchPlaceholder = 'Search...',
		headers,
		children
	}: Props = $props();
</script>

<div class="bg-card border border-surface rounded-xl p-5">
	{#if title || filters.length > 0}
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
			{#if title}
				<div>
					<h3 class="text-lg font-semibold text-textMain">{title}</h3>
					{#if subtitle}
						<p class="text-xs text-textSec mt-0.5">{subtitle}</p>
					{/if}
				</div>
			{/if}
			{#if filters.length > 0}
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-border">
						{#each filters as filter (filter.value)}
							<button
								class="px-3 py-1.5 text-xs font-medium transition-colors {activeFilter ===
								filter.value
									? filterActiveClass
									: 'bg-transparent text-textSec hover:bg-surface'}"
								onclick={() => onfilterchange?.(filter.value)}
							>
								{filter.label}
							</button>
						{/each}
					</div>
					<div
						class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5"
					>
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input
							type="text"
							placeholder={searchPlaceholder}
							class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32"
						/>
					</div>
				</div>
			{/if}
		</div>
	{/if}
	<DataTable {headers}>
		{@render children()}
	</DataTable>
</div>

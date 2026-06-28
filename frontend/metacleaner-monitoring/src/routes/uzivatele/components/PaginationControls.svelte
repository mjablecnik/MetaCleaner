<script lang="ts">
	import { t } from '$lib/i18n';

	interface Props {
		currentPage?: number;
		totalPages?: number;
		totalItems?: string;
		from?: string;
		to?: string;
		variant?: 'desktop' | 'mobile';
	}

	let {
		currentPage = 1,
		totalPages = 210,
		totalItems = '2 100',
		from = '1',
		to = '10',
		variant = 'desktop'
	}: Props = $props();

	const nearbyPages = $derived([1, 2, 3].filter((p) => p <= totalPages));
</script>

{#if variant === 'desktop'}
	<div
		class="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-surface gap-3"
	>
		<p class="text-sm text-textSec">
			{t('common_pagination_showing', { from, to, total: totalItems })}
		</p>
		<div class="flex items-center gap-1">
			<button
				class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors"
			>
				<i class="fa-solid fa-chevron-left text-xs"></i>
			</button>
			{#each nearbyPages as page (page)}
				<button
					class="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors {page === currentPage
						? 'bg-primary text-white'
						: 'bg-badge border border-border text-textSec hover:text-textMain'}"
				>
					{page}
				</button>
			{/each}
			{#if totalPages > 3}
				<span class="text-textSec px-1">…</span>
				<button
					class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors"
				>
					{totalPages}
				</button>
			{/if}
			<button
				class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors"
			>
				<i class="fa-solid fa-chevron-right text-xs"></i>
			</button>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-between px-4 py-3 border-t border-surface">
		<button
			class="flex items-center gap-2 px-4 py-2 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors min-h-[44px]"
		>
			<i class="fa-solid fa-chevron-left text-xs"></i>
			<span>{t('common_pagination_previous')}</span>
		</button>
		<div class="flex items-center gap-1">
			{#each nearbyPages as page (page)}
				<button
					class="w-9 h-9 text-sm rounded-lg font-medium transition-colors {page === currentPage
						? 'bg-primary text-white'
						: 'bg-badge border border-border text-textSec hover:text-textMain'}"
				>
					{page}
				</button>
			{/each}
			{#if totalPages > 3}
				<span class="text-textSec px-1 text-sm">…</span>
			{/if}
		</div>
		<button
			class="flex items-center gap-2 px-4 py-2 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors min-h-[44px]"
		>
			<span>{t('common_pagination_next')}</span>
			<i class="fa-solid fa-chevron-right text-xs"></i>
		</button>
	</div>
{/if}

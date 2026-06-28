<script lang="ts">
	import type { SlowQuery } from '$lib/repositories/databaseRepository';

	interface Props {
		query: SlowQuery;
		variant?: 'desktop' | 'mobile';
	}

	let { query, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="flex items-start gap-4 p-3 rounded-lg bg-surface/40 border border-border/40">
		<div class="flex-shrink-0 mt-0.5">
			<span class="px-2 py-0.5 {query.typeClass} text-xs font-mono rounded font-semibold"
				>{query.type}</span
			>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-textMain text-sm font-medium font-mono truncate">{query.sql}</p>
			<p class="text-xs text-textSec mt-0.5">{query.meta}</p>
		</div>
		<div class="flex-shrink-0 text-right">
			<div class="{query.avgClass} font-bold text-sm">{query.avgMs.toLocaleString()} ms</div>
			<div class="text-xs text-textSec">avg</div>
		</div>
	</div>
{:else}
	<div class="p-3 rounded-xl bg-surface/40 border border-border/40">
		<div class="flex items-start justify-between gap-2 mb-1.5">
			<span class="px-2 py-0.5 {query.typeClass} text-[10px] font-mono rounded font-semibold flex-shrink-0"
				>{query.type}</span
			>
			<span class="{query.avgClass} font-bold text-sm">{query.avgMs.toLocaleString()} ms</span>
		</div>
		<p class="text-textMain text-xs font-mono truncate">{query.sql}</p>
		<p class="text-[10px] text-textSec mt-1">{query.meta}</p>
	</div>
{/if}

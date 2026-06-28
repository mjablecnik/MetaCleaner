<script lang="ts">
	import type { TopEndpoint } from '$lib/repositories/errorsRepository';

	interface Props {
		endpoint: TopEndpoint;
		variant?: 'desktop' | 'mobile';
	}

	let { endpoint: ep, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="flex items-center gap-4 p-3 rounded-lg bg-surface/40 border border-border/40">
		<span class="px-2 py-0.5 text-xs font-mono rounded font-semibold {ep.methodClass}"
			>{ep.method}</span
		>
		<span class="text-textMain text-sm font-medium flex-1 truncate">{ep.path}</span>
		<div class="flex items-center gap-3">
			<div class="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
				<div class="h-full {ep.barClass} rounded-full" style="width:{ep.barWidth}"></div>
			</div>
			<span class="{ep.countClass} font-semibold text-sm w-8 text-right">{ep.errorCount}</span>
		</div>
	</div>
{:else}
	<div class="flex items-center gap-3 p-3 rounded-lg bg-surface/40 border border-border/40">
		<span class="px-2 py-0.5 text-[10px] font-mono rounded font-semibold shrink-0 {ep.methodClass}"
			>{ep.method}</span
		>
		<span class="text-textMain text-xs font-medium flex-1 truncate">{ep.path}</span>
		<div class="flex items-center gap-2 shrink-0">
			<div class="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
				<div class="h-full {ep.barClass} rounded-full" style="width:{ep.barWidth}"></div>
			</div>
			<span class="{ep.countClass} font-bold text-xs w-5 text-right">{ep.errorCount}</span>
		</div>
	</div>
{/if}

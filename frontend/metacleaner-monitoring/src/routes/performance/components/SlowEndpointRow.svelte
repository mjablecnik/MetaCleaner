<script lang="ts">
	import type { SlowEndpoint } from '$lib/repositories/performanceRepository';

	interface Props {
		endpoint: SlowEndpoint;
		variant?: 'desktop' | 'mobile';
	}

	let { endpoint: ep, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="flex items-center gap-4 p-3 rounded-lg bg-surface/40 border border-border/40">
		<span class="px-2 py-0.5 {ep.methodClass} text-xs font-mono rounded font-semibold flex-shrink-0"
			>{ep.method}</span
		>
		<div class="flex-1 min-w-0">
			<p class="text-textMain text-sm font-mono truncate">{ep.path}</p>
			<p class="text-xs text-textSec mt-0.5">Calls: {ep.callCount} · Errors: {ep.errorRate}</p>
		</div>
		<div class="flex-shrink-0 w-28">
			<div class="flex items-center justify-between mb-1">
				<span class="{ep.timeColor} font-bold text-sm">{ep.avgMs.toLocaleString()} ms</span>
			</div>
			<div class="w-full h-1 bg-surface rounded-full overflow-hidden">
				<div class="h-full {ep.barColor} rounded-full" style="width:{ep.barWidth}"></div>
			</div>
		</div>
	</div>
{:else}
	<div class="p-4">
		<div class="flex items-center gap-2 mb-2">
			<span
				class="px-1.5 py-0.5 {ep.methodClass} text-xs font-mono rounded font-semibold flex-shrink-0"
				>{ep.method}</span
			>
			<p class="text-textMain text-xs font-mono truncate flex-1">{ep.path}</p>
			<span class="{ep.timeColor} font-bold text-sm flex-shrink-0"
				>{ep.avgMs.toLocaleString()} ms</span
			>
		</div>
		<div class="w-full h-1 bg-surface rounded-full overflow-hidden mb-1.5">
			<div class="h-full {ep.barColor} rounded-full" style="width:{ep.barWidth}"></div>
		</div>
		<p class="text-xs text-textSec">Calls: {ep.callCount} · Errors: {ep.errorRate}</p>
	</div>
{/if}

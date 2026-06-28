<script lang="ts">
	import { t } from '$lib/i18n';
	import type { ErrorLogEntry } from '$lib/repositories/errorsRepository';

	interface Props {
		entry: ErrorLogEntry;
		variant?: 'desktop' | 'mobile';
	}

	let { entry, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<tr class="hover:bg-surface/30 transition-colors">
		<td class="py-3 pr-4 text-textSec whitespace-nowrap">{entry.time}</td>
		<td class="py-3 pr-4">
			<span class="px-2 py-0.5 text-xs rounded font-medium {entry.typeClass}">{entry.type}</span>
		</td>
		<td class="py-3 pr-4 text-textMain max-w-xs truncate">{entry.message}</td>
		<td class="py-3 pr-4 text-textSec font-mono text-xs">{entry.source}</td>
		<td class="py-3">
			<span class="px-2 py-0.5 text-xs rounded {entry.statusClass}">{t(entry.statusKey)}</span>
		</td>
	</tr>
{:else}
	<div class="p-3 rounded-xl bg-surface/40 border border-border/40 space-y-2">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="px-2 py-0.5 text-[10px] rounded font-bold {entry.typeClass}"
					>{entry.type}</span
				>
				<span class="text-textSec text-[10px]">{entry.time}</span>
			</div>
			<span class="px-2 py-0.5 text-[10px] rounded font-medium {entry.statusClass}"
				>{t(entry.statusKey)}</span
			>
		</div>
		<p class="text-xs text-textMain font-medium leading-snug">{entry.message}</p>
		<p class="text-[10px] text-textSec font-mono">{entry.source}</p>
	</div>
{/if}

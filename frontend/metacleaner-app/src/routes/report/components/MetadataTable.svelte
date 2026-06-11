<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { MetadataField } from '$lib/types/report';

	interface Props {
		fields: MetadataField[];
	}

	const { fields }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="flex flex-col">
	{#each fields as field, i (i)}
		{#if field.moreCount !== undefined}
			<div class="flex items-center justify-between border-b border-gray-800/50 px-2 py-2 last:border-b-0">
				<span class="text-xs text-text-muted">+ {field.moreCount} {tx('report.files.more')}</span>
				<span class="font-mono text-[11px] text-brand-red line-through"
					>{tx('report.files.removed')}</span
				>
			</div>
		{:else}
			<div class="flex items-start justify-between gap-4 border-b border-gray-800/50 px-2 py-2.5 last:border-b-0">
				<span class="shrink-0 text-xs font-medium text-text-muted">{field.label}</span>
				<span
					class="max-w-[60%] break-all text-right font-mono text-[11px] text-brand-red line-through"
					title={field.value}
				>{field.value}</span>
			</div>
		{/if}
	{/each}
</div>

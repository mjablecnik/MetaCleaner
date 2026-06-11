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

<div class="flex flex-col gap-1.5">
	{#each fields as field, i (i)}
		{#if field.moreCount !== undefined}
			<div class="flex items-center justify-between gap-2">
				<span class="text-xs text-text-muted">+ {field.moreCount} {tx('report.files.more')}</span>
				<span class="shrink-0 font-mono text-xs text-brand-red line-through"
					>{tx('report.files.removed')}</span
				>
			</div>
		{:else}
			<div class="flex items-start justify-between gap-3">
				<span class="shrink-0 text-xs text-text-muted">{field.label}</span>
				<span
					class="max-w-[60%] truncate text-right font-mono text-xs text-brand-red line-through"
					title={field.value}>{field.value}</span
				>
			</div>
		{/if}
	{/each}
</div>

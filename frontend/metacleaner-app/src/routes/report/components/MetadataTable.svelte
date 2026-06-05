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
			<div class="flex justify-between">
				<span class="text-xs text-text-muted">+ {field.moreCount} {tx('report.files.more')}</span>
				<span class="font-mono text-xs text-brand-red line-through"
					>{tx('report.files.removed')}</span
				>
			</div>
		{:else}
			<div class="flex justify-between">
				<span class="text-xs text-text-muted">{field.label}</span>
				<span class="font-mono text-xs text-brand-red line-through">{field.value}</span>
			</div>
		{/if}
	{/each}
</div>

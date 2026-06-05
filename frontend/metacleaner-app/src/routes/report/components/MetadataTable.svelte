<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { MetadataField } from '$lib/repositories/reportRepository';

	interface Props {
		fields: MetadataField[];
	}

	const { fields }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="flex flex-col gap-1.5">
	{#each fields as field}
		{#if field.moreCount !== undefined}
			<div class="flex justify-between">
				<span class="text-xs text-text-muted">+ {field.moreCount} {tx('report.files.more')}</span>
				<span class="text-xs font-mono text-brand-red line-through">{tx('report.files.removed')}</span>
			</div>
		{:else}
			<div class="flex justify-between">
				<span class="text-xs text-text-muted">{field.label}</span>
				<span class="text-xs font-mono text-brand-red line-through">{field.value}</span>
			</div>
		{/if}
	{/each}
</div>

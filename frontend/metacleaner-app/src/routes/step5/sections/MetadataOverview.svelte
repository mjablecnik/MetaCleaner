<script lang="ts">
	import type { MetadataBreakdown, ProcessingResults } from '$lib/repositories/processingRepository';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import MetadataPanel from '../components/MetadataPanel.svelte';

	interface Props {
		results: ProcessingResults | null;
	}

	const { results }: Props = $props();

	let metaAccordionOpen = $state(true);
	let activeMetaTab = $state<'before' | 'after'>('before');

	const emptyBreakdown: MetadataBreakdown = {
		gpsLocations: 0,
		exifFields: 0,
		xmpFields: 0,
		id3mp4Fields: 0,
		otherFields: 0
	};

	const breakdown = $derived(results?.beforeBreakdown ?? emptyBreakdown);
	const totalFieldsRemoved = $derived(results?.fieldsRemoved ?? 87);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<!-- Desktop: side-by-side panels -->
<div class="fade-in-up delay-2 hidden lg:block bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card">
	<h3 class="font-semibold text-lg text-white mb-6">{tx('step5.metadata.title')}</h3>
	<div class="grid grid-cols-2 gap-6">
		<MetadataPanel type="before" {breakdown} {totalFieldsRemoved} />
		<MetadataPanel type="after" {breakdown} {totalFieldsRemoved} />
	</div>
</div>

<!-- Mobile: accordion with tabs -->
<div class="fade-in-up delay-2 lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
	<button
		onclick={() => (metaAccordionOpen = !metaAccordionOpen)}
		class="w-full flex items-center justify-between px-5 py-4 min-h-[52px]"
	>
		<span class="font-semibold text-base text-white">{tx('step5.metadata.title')}</span>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-sm transition-transform"
			style="transform: {metaAccordionOpen ? 'rotate(180deg)' : ''}"
		></i>
	</button>
	{#if metaAccordionOpen}
		<div class="flex flex-col gap-4 px-4 pb-5">
			<!-- Tabs -->
			<div class="flex rounded-xl bg-navy-main/60 p-1 gap-1">
				<button
					onclick={() => (activeMetaTab = 'before')}
					class="flex-1 py-2 rounded-lg text-xs font-bold transition-all border {activeMetaTab === 'before'
						? 'text-brand-red bg-brand-red/10 border-brand-red/30'
						: 'text-text-muted bg-transparent border-transparent'}"
				>
					<i class="fa-solid fa-triangle-exclamation mr-1"></i>
					{tx('step5.metadata.before')}
				</button>
				<button
					onclick={() => (activeMetaTab = 'after')}
					class="flex-1 py-2 rounded-lg text-xs font-bold transition-all border {activeMetaTab === 'after'
						? 'text-brand-green bg-brand-green/10 border-brand-green/30'
						: 'text-text-muted bg-transparent border-transparent'}"
				>
					<i class="fa-solid fa-shield-halved mr-1"></i>
					{tx('step5.metadata.after')}
				</button>
			</div>
			<!-- Active tab panel -->
			{#if activeMetaTab === 'before'}
				<MetadataPanel type="before" {breakdown} {totalFieldsRemoved} />
			{:else}
				<MetadataPanel type="after" {breakdown} {totalFieldsRemoved} />
			{/if}
		</div>
	{/if}
</div>

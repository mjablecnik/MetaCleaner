<script lang="ts">
	import type {
		MetadataBreakdown,
		ProcessingResults
	} from '$lib/repositories/processingRepository';
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
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<!-- Desktop: side-by-side panels -->
<div
	class="fade-in-up hidden rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card delay-2 lg:block"
>
	<h3 class="mb-6 text-lg font-semibold text-white">{tx('step5.metadata.title')}</h3>
	<div class="grid grid-cols-2 gap-6">
		<MetadataPanel type="before" {breakdown} {totalFieldsRemoved} />
		<MetadataPanel type="after" {breakdown} {totalFieldsRemoved} />
	</div>
</div>

<!-- Mobile: accordion with tabs -->
<div
	class="fade-in-up overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card delay-2 lg:hidden"
>
	<button
		onclick={() => (metaAccordionOpen = !metaAccordionOpen)}
		class="flex min-h-[52px] w-full items-center justify-between px-5 py-4"
	>
		<span class="text-base font-semibold text-white">{tx('step5.metadata.title')}</span>
		<i
			class="fa-solid fa-chevron-down text-sm text-text-muted transition-transform"
			style="transform: {metaAccordionOpen ? 'rotate(180deg)' : ''}"
		></i>
	</button>
	{#if metaAccordionOpen}
		<div class="flex flex-col gap-4 px-4 pb-5">
			<!-- Tabs -->
			<div class="flex gap-1 rounded-xl bg-navy-main/60 p-1">
				<button
					onclick={() => (activeMetaTab = 'before')}
					class="flex-1 rounded-lg border py-2 text-xs font-bold transition-all {activeMetaTab ===
					'before'
						? 'border-brand-red/30 bg-brand-red/10 text-brand-red'
						: 'border-transparent bg-transparent text-text-muted'}"
				>
					<i class="fa-solid fa-triangle-exclamation mr-1"></i>
					{tx('step5.metadata.before')}
				</button>
				<button
					onclick={() => (activeMetaTab = 'after')}
					class="flex-1 rounded-lg border py-2 text-xs font-bold transition-all {activeMetaTab ===
					'after'
						? 'border-brand-green/30 bg-brand-green/10 text-brand-green'
						: 'border-transparent bg-transparent text-text-muted'}"
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

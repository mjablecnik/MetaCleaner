<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ReportFileDetail } from '$lib/repositories/reportRepository';
	import FileAccordionItem from '../components/FileAccordionItem.svelte';

	interface Props {
		files: ReportFileDetail[];
	}

	let { files }: Props = $props();

	let accordionOpen = $state<boolean[]>([]);

	$effect(() => {
		if (files.length > 0 && accordionOpen.length === 0) {
			accordionOpen = files.map((_, i) => i === 0);
		}
	});

	let allOpen = $derived(accordionOpen.length > 0 && accordionOpen.every((v) => v));

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function toggleAccordion(index: number) {
		accordionOpen[index] = !accordionOpen[index];
	}

	function toggleAll() {
		const next = !allOpen;
		accordionOpen = accordionOpen.map(() => next);
	}
</script>

<div
	class="fade-in-up flex flex-col gap-3 delay-3 lg:gap-4 lg:rounded-2xl lg:border lg:border-gray-800 lg:bg-navy-card lg:p-6 lg:shadow-card"
>
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('report.files.title')}</h3>
		<button
			onclick={toggleAll}
			class="flex items-center gap-1 rounded-lg border border-brand-blue/20 bg-brand-blue/10 px-3 py-2 text-xs font-semibold text-brand-blue transition-colors hover:bg-brand-blue/20"
		>
			<i class="fa-solid fa-list text-[10px]"></i>
			{allOpen ? tx('report.files.collapseAll') : tx('report.files.expandAll')}
		</button>
	</div>

	{#each files as file, i (file.name)}
		<FileAccordionItem {file} open={accordionOpen[i]} onToggle={() => toggleAccordion(i)} />
	{/each}
</div>

<script lang="ts">
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import type { ProcessingResults } from '$lib/repositories/processingRepository';
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import FileResultItem from '../components/FileResultItem.svelte';

	interface Props {
		results: ProcessingResults | null;
		uploadedFiles: UploadedFile[];
	}

	const { results, uploadedFiles }: Props = $props();

	function getFileById(id: string): UploadedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<!-- File Results Card -->
<div class="fade-in-up delay-3 bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step5.results.title')}</h3>
		<span
			class="text-[10px] font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 uppercase tracking-wider flex items-center gap-1.5"
		>
			<i class="fa-solid fa-circle-check text-[10px]"></i>
			{tx('step5.results.allDone')}
		</span>
	</div>

	<!-- Files Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
		{#if results}
			{#each results.fileResults as fileResult}
				{@const file = getFileById(fileResult.fileId)}
				{#if file}
					<FileResultItem {file} result={fileResult} />
				{/if}
			{/each}
		{/if}
	</div>

	<!-- Desktop Action Buttons -->
	<div class="hidden lg:flex gap-3 mt-1">
		<button
			class="flex-1 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-400 transition-all flex items-center justify-center gap-2 shadow-glow-green"
		>
			<i class="fa-solid fa-download"></i>
			{tx('step5.actions.downloadAll')}
		</button>
		<a
			href="/report"
			class="px-5 py-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm hover:bg-brand-blue/20 transition-all flex items-center gap-2"
		>
			<i class="fa-solid fa-file-lines"></i>
			{tx('step5.actions.viewReport')}
		</a>
		<a
			href="/reports"
			class="px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2"
		>
			<i class="fa-solid fa-clock-rotate-left"></i>
			{tx('step5.actions.history')}
		</a>
	</div>
</div>

<!-- Mobile Sticky Bottom CTA -->
<div
	class="lg:hidden fixed bottom-0 left-0 right-0 bg-navy-main/95 backdrop-blur border-t border-gray-800 px-4 py-3 flex flex-col gap-2 z-50"
>
	<button
		class="w-full py-4 rounded-xl bg-brand-green text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-green active:scale-95 transition-transform"
	>
		<i class="fa-solid fa-download"></i>
		{tx('step5.actions.downloadAll')}
	</button>
	<div class="flex gap-2">
		<a
			href="/report"
			class="flex-1 py-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
		>
			<i class="fa-solid fa-file-lines"></i>
			{tx('step5.actions.viewReport')}
		</a>
		<a
			href="/reports"
			class="flex-1 py-3 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
		>
			<i class="fa-solid fa-clock-rotate-left"></i>
			{tx('step5.actions.history')}
		</a>
		<a
			href="/"
			class="flex-1 py-3 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
		>
			<i class="fa-solid fa-arrow-up-from-bracket text-text-muted"></i>
			{tx('step5.actions.new')}
		</a>
	</div>
</div>

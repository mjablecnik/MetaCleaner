<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { QueuedFile } from '$lib/scanner/types';
	import type { ProcessingState } from '$lib/repositories/processingRepository';
	import FileItemProcessing from '../components/FileItemProcessing.svelte';

	interface Props {
		processingState: ProcessingState | null;
		uploadedFiles: QueuedFile[];
		overallPct: number;
	}

	const { processingState, uploadedFiles, overallPct }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): QueuedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}
</script>

<div class="flex flex-col gap-4 lg:gap-5">
	<div
		class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6"
	>
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.files.title')}</h3>
			<span
				class="flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-brand-blue uppercase lg:px-3 lg:text-xs"
			>
				<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
				{tx('step3.status.processing')}
			</span>
		</div>

		<!-- Overall Progress -->
		<div class="rounded-xl border border-blue-900/30 bg-navy-main/60 p-3 lg:p-4">
			<div class="mb-1.5 flex items-center justify-between lg:mb-2">
				<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
				<span class="text-xs font-bold text-brand-blue">{Math.round(overallPct)}%</span>
			</div>
			<div class="h-2.5 w-full overflow-hidden rounded-full bg-navy-lighter">
				<div
					class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
					style="width:{overallPct}%; transition: width 0.6s ease;"
				></div>
			</div>
			<div class="mt-1.5 flex items-center justify-between lg:mt-2">
				<span class="text-[10px] text-text-muted lg:text-[11px]">
					{tx('step3.progress.filesCompleted', {
						done: processingState?.filesCompleted ?? 0,
						total: processingState?.totalFiles ?? 0
					})}
				</span>
				<span class="text-[10px] text-text-muted lg:text-[11px]">
					{tx('step3.progress.timeRemaining', {
						time: `${processingState?.timeRemainingSeconds ?? 0}s`
					})}
				</span>
			</div>
		</div>

		<!-- File List -->
		<div class="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
			{#each processingState?.files ?? [] as fileState (fileState.fileId)}
				{@const file = getFileById(fileState.fileId)}
				{#if file}
					<FileItemProcessing
						{file}
						status={fileState.status}
						progress={fileState.progress}
						fieldsRemoved={fileState.fieldsRemoved}
						gpsRemoved={fileState.gpsRemoved}
					/>
				{/if}
			{/each}
		</div>

		<!-- Action Buttons -->
		<div class="mt-1 flex gap-3">
			<button
				disabled
				class="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-brand-green/40 py-3.5 text-sm font-bold text-white/50"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i>
				{tx('step1.actions.startCleaning')}
			</button>
			<a
				href={resolve('/step4' as Pathname)}
				class="flex items-center gap-2 rounded-xl border border-brand-red/30 bg-brand-red/10 px-5 py-3.5 text-sm font-semibold text-brand-red transition-all hover:bg-brand-red/20"
			>
				<i class="fa-solid fa-stop"></i>
				{tx('step3.actions.stop')}
			</a>
		</div>
		<a
			href={resolve('/step5' as Pathname)}
			class="mt-1 flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-brand-green"
		>
			<i class="fa-solid fa-arrow-right text-[10px]"></i>
			{tx('step3.actions.orGoToResults')}
		</a>
	</div>
</div>

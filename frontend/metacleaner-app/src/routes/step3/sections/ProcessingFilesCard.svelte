<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import type { ProcessingState } from '$lib/repositories/processingRepository';
	import FileItemProcessing from '../components/FileItemProcessing.svelte';

	interface Props {
		processingState: ProcessingState | null;
		uploadedFiles: UploadedFile[];
		overallPct: number;
	}

	const { processingState, uploadedFiles, overallPct }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): UploadedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}
</script>

<div class="flex flex-col gap-4 lg:gap-5">
	<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 flex flex-col gap-4 shadow-card">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.files.title')}</h3>
			<span
				class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1.5"
			>
				<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
				{tx('step3.status.processing')}
			</span>
		</div>

		<!-- Overall Progress -->
		<div class="bg-navy-main/60 rounded-xl p-3 lg:p-4 border border-blue-900/30">
			<div class="flex items-center justify-between mb-1.5 lg:mb-2">
				<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
				<span class="text-xs font-bold text-brand-blue">{Math.round(overallPct)}%</span>
			</div>
			<div class="w-full h-2.5 bg-navy-lighter rounded-full overflow-hidden">
				<div
					class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
					style="width:{overallPct}%; transition: width 0.6s ease;"
				></div>
			</div>
			<div class="flex items-center justify-between mt-1.5 lg:mt-2">
				<span class="text-[10px] lg:text-[11px] text-text-muted">
					{tx('step3.progress.filesCompleted', {
						done: processingState?.filesCompleted ?? 0,
						total: processingState?.totalFiles ?? 0
					})}
				</span>
				<span class="text-[10px] lg:text-[11px] text-text-muted">
					{tx('step3.progress.timeRemaining', { time: `${processingState?.timeRemainingSeconds ?? 0}s` })}
				</span>
			</div>
		</div>

		<!-- File List -->
		<div class="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
			{#each processingState?.files ?? [] as fileState}
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
		<div class="flex gap-3 mt-1">
			<button
				disabled
				class="flex-1 py-3.5 rounded-xl bg-brand-green/40 text-white/50 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i> {tx('step1.actions.startCleaning')}
			</button>
			<a
				href="/step4"
				class="px-5 py-3.5 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red font-semibold text-sm hover:bg-brand-red/20 transition-all flex items-center gap-2"
			>
				<i class="fa-solid fa-stop"></i> {tx('step3.actions.stop')}
			</a>
		</div>
		<a
			href="/step5"
			class="text-xs text-text-muted hover:text-brand-green transition-colors flex items-center gap-1 mt-1"
		>
			<i class="fa-solid fa-arrow-right text-[10px]"></i> {tx('step3.actions.orGoToResults')}
		</a>
	</div>
</div>

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { QueuedFile } from '$lib/scanner/types';
	import FileProcessingRow from './components/FileProcessingRow.svelte';
	import type { FileRowState } from './components/FileProcessingRow.svelte';

	export interface FileWithState {
		file: QueuedFile;
		state: FileRowState;
	}

	interface Props {
		processedFiles: FileWithState[];
		overallProgress: number;
		filesCompleted: number;
		totalFiles: number;
		timeRemainingSeconds: number;
		onStop: () => void;
	}

	const {
		processedFiles,
		overallProgress,
		filesCompleted,
		totalFiles,
		timeRemainingSeconds,
		onStop
	}: Props = $props();

	function formatSeconds(s: number): string {
		const min = Math.floor(s / 60);
		const sec = s % 60;
		return min > 0 ? `${min}m ${sec}s` : `${s}s`;
	}
</script>

<div
	class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6"
>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step3.status.title')}</h3>
		<span
			class="flex items-center gap-1 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-brand-blue uppercase lg:gap-1.5 lg:px-3 lg:text-xs"
		>
			<i class="fa-solid fa-circle-notch spin-slow text-[9px] lg:text-[10px]"></i>
			{tx('step3.status.processing')}
		</span>
	</div>

	<!-- Overall Progress -->
	<div class="rounded-xl border border-blue-900/30 bg-navy-main/60 p-3 lg:p-4">
		<div class="mb-1.5 flex items-center justify-between lg:mb-2">
			<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
			<span class="text-xs font-bold text-brand-blue">{overallProgress}%</span>
		</div>
		<div class="h-2.5 w-full overflow-hidden rounded-full bg-navy-lighter">
			<div
				class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400 transition-all duration-300"
				style="width: {overallProgress}%"
			></div>
		</div>
		<div class="mt-1.5 flex items-center justify-between lg:mt-2">
			<span class="text-[10px] text-text-muted lg:text-[11px]">
				{tx('step3.progress.filesCompleted', { done: filesCompleted, total: totalFiles })}
			</span>
			{#if timeRemainingSeconds > 0}
				<span class="text-[10px] text-text-muted lg:text-[11px]">
					{tx('step3.progress.timeRemaining', { time: formatSeconds(timeRemainingSeconds) })}
				</span>
			{/if}
		</div>
	</div>

	<!-- Per-file List -->
	<div class="flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[320px]">
		{#each processedFiles as { file, state } (file.id)}
			<FileProcessingRow {file} {state} />
		{/each}
	</div>

	<!-- Action Buttons -->
	<div class="mt-1 flex gap-3">
		<button
			disabled
			class="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-brand-green/40 py-3.5 text-sm font-bold text-white/50 lg:py-3.5"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			{tx('common.startCleaning')}
		</button>
		<button
			onclick={onStop}
			class="flex items-center gap-2 rounded-xl border border-brand-red/30 bg-brand-red/10 px-4 py-3.5 text-sm font-semibold text-brand-red transition-all hover:bg-brand-red/20 lg:px-5"
		>
			<i class="fa-solid fa-stop"></i>
			{tx('step3.actions.stop')}
		</button>
	</div>
</div>

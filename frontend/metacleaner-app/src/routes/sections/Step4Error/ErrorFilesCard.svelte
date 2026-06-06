<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { QueuedFile } from '$lib/scanner/types';

	export interface FileWithErrorState {
		file: QueuedFile;
		status: 'done' | 'error' | 'skipped';
		fieldsRemoved: number;
		gpsRemoved: boolean;
	}

	interface Props {
		filesWithState: FileWithErrorState[];
		doneCount: number;
		totalFiles: number;
		overallProgress: number;
		onTryAgain: () => void;
		onClearAll: () => void;
	}

	const { filesWithState, doneCount, totalFiles, overallProgress, onTryAgain, onClearAll }: Props =
		$props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	function rowBorderClass(status: string): string {
		if (status === 'done') return 'border-brand-green/20 bg-navy-main/60';
		if (status === 'error') return 'border-brand-red/30 bg-brand-red/5';
		return 'border-gray-800 bg-navy-main/60 opacity-50';
	}

	function iconContainerClass(status: string, fileType: string): string {
		if (status === 'done') return 'border-brand-green/20 bg-brand-green/10';
		if (status === 'error') return 'border-brand-red/20 bg-brand-red/10';
		return fileType === 'video'
			? 'border-brand-orange/20 bg-brand-orange/10'
			: 'border-brand-blue/20 bg-brand-blue/10';
	}

	function iconColorClass(status: string, fileType: string): string {
		if (status === 'done') return 'text-brand-green';
		if (status === 'error') return 'text-brand-red';
		return fileType === 'video' ? 'text-brand-orange' : 'text-brand-blue';
	}
</script>

<div
	class="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:h-[539px] lg:gap-4 lg:p-6"
>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-white lg:text-lg">{tx('step1.files.title')}</h3>
		<span
			class="flex items-center gap-1 rounded-full border border-brand-red/20 bg-brand-red/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-brand-red uppercase lg:gap-1.5 lg:px-3 lg:text-xs"
		>
			<i class="fa-solid fa-circle-xmark text-[9px] lg:text-[10px]"></i>
			{tx('step4.badge.errorMobile')}
		</span>
	</div>

	<!-- Overall Progress (red, interrupted) -->
	<div class="rounded-xl border border-red-900/30 bg-navy-main/60 p-3 lg:p-4">
		<div class="mb-1.5 flex items-center justify-between lg:mb-2">
			<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
			<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
		</div>
		<div class="h-2.5 w-full overflow-hidden rounded-full bg-navy-lighter">
			<div
				class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400"
				style="width: {overallProgress}%"
			></div>
		</div>
		<div class="mt-1.5 flex items-center justify-between lg:mt-2">
			<span class="text-[10px] text-text-muted lg:text-[11px]">
				{tx('step3.progress.filesCompleted', { done: doneCount, total: totalFiles })}
			</span>
			<span class="flex items-center gap-1 text-[10px] font-medium text-brand-red lg:text-[11px]">
				<i class="fa-solid fa-circle-xmark text-[9px]"></i>
				{tx('step4.error.processingFailed')}
			</span>
		</div>
	</div>

	<!-- Per-file List -->
	<div class="flex flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[320px]">
		{#each filesWithState as { file, status, fieldsRemoved, gpsRemoved } (file.id)}
			<div
				class="flex cursor-default items-center gap-3 rounded-xl border px-3 py-3 lg:py-2.5 {rowBorderClass(
					status
				)}"
			>
				<!-- File icon -->
				<div
					class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border {iconContainerClass(
						status,
						file.type
					)}"
				>
					<i
						class="fa-solid {file.type === 'video'
							? 'fa-video'
							: 'fa-image'} text-sm {iconColorClass(status, file.type)}"
					></i>
				</div>

				<!-- File info -->
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium text-white">{file.name}</p>
					<div class="mt-0.5 flex items-center gap-1.5">
						<span class="text-[10px] text-text-muted lg:text-[11px]">{formatSize(file.size)}</span>
						<span class="h-1 w-1 rounded-full bg-gray-600"></span>

						{#if status === 'done'}
							<span
								class="flex items-center gap-1 text-[10px] font-medium text-brand-green lg:text-[11px]"
							>
								<i class="fa-solid fa-circle-check text-[8px] lg:text-[9px]"></i>
								{#if gpsRemoved}
									GPS + {fieldsRemoved}
									{tx('step3.files.fieldsRemoved')}
								{:else}
									{fieldsRemoved}
									{tx('step3.files.fieldsRemoved')}
								{/if}
							</span>
						{:else if status === 'error'}
							<span
								class="flex items-center gap-1 text-[10px] font-medium text-brand-red lg:text-[11px]"
							>
								<i class="fa-solid fa-circle-xmark text-[8px] lg:text-[9px]"></i>
								{tx('step4.error.processingFailed')}
							</span>
						{:else}
							<span class="flex items-center gap-1 text-[10px] text-text-muted lg:text-[11px]">
								<i class="fa-solid fa-ban text-[8px] lg:text-[9px]"></i>
								{tx('step4.error.skipped')}
							</span>
						{/if}
					</div>
				</div>

				<!-- Right side indicator -->
				<div class="flex flex-shrink-0 items-center gap-1.5 lg:gap-2">
					<span
						class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
					>
						{file.extension.replace('.', '').toUpperCase() || 'FILE'}
					</span>
					{#if status === 'done'}
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
						>
							<i class="fa-solid fa-check text-[10px] text-brand-green"></i>
						</div>
					{:else if status === 'error'}
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-red/30 bg-brand-red/10"
						>
							<i class="fa-solid fa-xmark text-[10px] text-brand-red"></i>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Action Buttons -->
	<div class="mt-1 flex gap-3">
		<button
			onclick={onTryAgain}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400"
		>
			<i class="fa-solid fa-rotate-right"></i>
			{tx('step4.actions.tryAgain')}
		</button>
		<button
			onclick={onClearAll}
			class="flex items-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter px-4 py-3.5 text-sm font-semibold text-text-muted transition-all hover:bg-gray-800 hover:text-white lg:px-5"
		>
			<i class="fa-solid fa-trash"></i>
			<span class="hidden lg:inline">{tx('step4.actions.clearAll')}</span>
		</button>
	</div>
</div>

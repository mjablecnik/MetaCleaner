<script lang="ts">
	import { resolve } from '$app/paths';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/repositories/processingRepository';
	import type { QueuedFile } from '$lib/scanner/types';

	interface Props {
		errorState: ErrorState | null;
		uploadedFiles: QueuedFile[];
	}

	const { errorState, uploadedFiles }: Props = $props();

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

	function extLabel(ext: string): string {
		return ext.replace('.', '').toUpperCase() || 'FILE';
	}

	function getFileLogStatus(fileId: string): 'success' | 'error' | 'skipped' | undefined {
		const entry = errorState?.log.find((l) => l.fileId === fileId);
		return entry?.status as 'success' | 'error' | 'skipped' | undefined;
	}

	const overallProgress = $derived(
		errorState ? Math.round((errorState.filesCompleted / errorState.totalFiles) * 100) : 0
	);
</script>

<div
	class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6"
>
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.files.title')}</h3>
		<span
			class="flex items-center gap-1.5 rounded-full border border-brand-red/20 bg-brand-red/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-brand-red uppercase lg:px-3 lg:text-xs"
		>
			<i class="fa-solid fa-circle-xmark text-[10px]"></i>
			{tx('step4.badge.errorMobile')}
		</span>
	</div>

	<!-- Overall Progress — desktop only -->
	<div class="hidden rounded-xl border border-red-900/30 bg-navy-main/60 p-4 lg:block">
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
			<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
		</div>
		<div class="h-2.5 w-full overflow-hidden rounded-full bg-navy-lighter">
			<div
				class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400"
				style="width:{overallProgress}%"
			></div>
		</div>
		<div class="mt-2 flex items-center justify-between">
			<span class="text-[11px] text-text-muted"
				>{tx('step3.progress.filesCompleted', {
					done: errorState?.filesCompleted ?? 0,
					total: errorState?.totalFiles ?? 0
				})}</span
			>
			<span class="flex items-center gap-1 text-[11px] font-medium text-brand-red">
				<i class="fa-solid fa-circle-xmark text-[9px]"></i>
				{tx('step4.error.processingFailed')}
			</span>
		</div>
	</div>

	<!-- File List -->
	<div class="flex flex-col gap-2 pr-1 lg:max-h-[320px] lg:overflow-y-auto">
		{#each uploadedFiles as file (file.id)}
			{@const fileStatus = getFileLogStatus(file.id)}
			{#if fileStatus === 'success'}
				<div
					class="flex cursor-default items-center gap-3 rounded-xl border border-brand-green/20 bg-navy-main/60 px-3 py-2.5"
				>
					<div
						class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10"
					>
						<i
							class="fa-solid {file.type === 'video'
								? 'fa-video'
								: 'fa-image'} text-sm text-brand-green"
						></i>
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-white">{file.name}</p>
						<div class="mt-0.5 flex items-center gap-1.5 lg:gap-2">
							<span class="text-[10px] text-text-muted lg:text-[11px]">{formatSize(file.size)}</span
							>
							<span class="h-1 w-1 rounded-full bg-gray-600"></span>
							<span
								class="flex items-center gap-1 text-[10px] font-medium text-brand-green lg:text-[11px]"
							>
								<i class="fa-solid fa-circle-check text-[9px]"></i>
								{#if file.scanResult?.hasGps}
									<span class="hidden lg:inline"
										>{tx('step3.files.gpsAndFieldsRemoved', {
											count: file.scanResult?.fieldCount ?? 0
										})}</span
									>
									<span class="inline lg:hidden"
										>{tx('step3.files.gpsAndFieldsRemovedMobile', {
											count: file.scanResult?.fieldCount ?? 0
										})}</span
									>
								{:else}
									{file.scanResult?.fieldCount ?? 0} {tx('step3.files.fieldsRemoved')}
								{/if}
							</span>
						</div>
					</div>
					<div class="flex flex-shrink-0 items-center gap-1.5 lg:gap-2">
						<span
							class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
							>{extLabel(file.extension)}</span
						>
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
						>
							<i class="fa-solid fa-check text-[10px] text-brand-green"></i>
						</div>
					</div>
				</div>
			{:else if fileStatus === 'error'}
				<div
					class="flex cursor-default items-center gap-3 rounded-xl border border-brand-red/30 bg-brand-red/5 px-3 py-2.5"
				>
					<div
						class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-red/20 bg-brand-red/10"
					>
						<i
							class="fa-solid {file.type === 'video'
								? 'fa-video'
								: 'fa-image'} text-sm text-brand-red"
						></i>
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-white">{file.name}</p>
						<div class="mt-0.5 flex items-center gap-1.5 lg:gap-2">
							<span class="text-[10px] text-text-muted lg:text-[11px]">{formatSize(file.size)}</span
							>
							<span class="h-1 w-1 rounded-full bg-gray-600"></span>
							<span
								class="flex items-center gap-1 text-[10px] font-medium text-brand-red lg:text-[11px]"
							>
								<i class="fa-solid fa-circle-xmark text-[9px]"></i>
								<span class="hidden lg:inline">{tx('step4.error.processingFailed')}</span>
								<span class="inline lg:hidden">{tx('step4.error.failedShort')}</span>
							</span>
						</div>
					</div>
					<div class="flex flex-shrink-0 items-center gap-1.5 lg:gap-2">
						<span
							class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
							>{extLabel(file.extension)}</span
						>
						<div
							class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-red/30 bg-brand-red/10"
						>
							<i class="fa-solid fa-xmark text-[10px] text-brand-red"></i>
						</div>
					</div>
				</div>
			{:else}
				<div
					class="flex cursor-default items-center gap-3 rounded-xl border border-gray-800 bg-navy-main/60 px-3 py-2.5 opacity-50"
				>
					<div
						class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10"
					>
						<i
							class="fa-solid {file.type === 'video'
								? 'fa-video'
								: 'fa-image'} text-sm text-brand-blue"
						></i>
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-white">{file.name}</p>
						<div class="mt-0.5 flex items-center gap-1.5 lg:gap-2">
							<span class="text-[10px] text-text-muted lg:text-[11px]">{formatSize(file.size)}</span
							>
							<span class="h-1 w-1 rounded-full bg-gray-600"></span>
							<span class="flex items-center gap-1 text-[10px] text-text-muted lg:text-[11px]">
								<i class="fa-solid fa-ban text-[9px]"></i>
								{tx('step4.error.skipped')}
							</span>
						</div>
					</div>
					<span
						class="flex-shrink-0 rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
						>{extLabel(file.extension)}</span
					>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Action Buttons -->
	<div class="mt-1 flex gap-3">
		<a
			href={resolve('/step3')}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400"
		>
			<i class="fa-solid fa-rotate-right"></i>
			{tx('step4.actions.tryAgain')}
		</a>
		<button
			class="flex items-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter px-4 py-3.5 text-sm font-semibold text-text-muted transition-all hover:bg-gray-800 hover:text-white lg:px-5"
		>
			<i class="fa-solid fa-trash"></i>
			<span class="hidden lg:inline">{tx('step4.actions.clearAll')}</span>
		</button>
	</div>
</div>

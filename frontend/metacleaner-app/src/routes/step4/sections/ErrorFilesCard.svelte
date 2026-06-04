<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/repositories/processingRepository';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	interface Props {
		errorState: ErrorState | null;
		uploadedFiles: UploadedFile[];
	}

	const { errorState, uploadedFiles }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function getFileLogStatus(fileId: string): 'success' | 'error' | 'skipped' | undefined {
		const entry = errorState?.log.find((l) => l.fileId === fileId);
		return entry?.status as 'success' | 'error' | 'skipped' | undefined;
	}

	const overallProgress = $derived(
		errorState ? Math.round((errorState.filesCompleted / errorState.totalFiles) * 100) : 0
	);
</script>

<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 flex flex-col gap-4 shadow-card">
	<div class="flex items-center justify-between">
		<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.files.title')}</h3>
		<span class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5">
			<i class="fa-solid fa-circle-xmark text-[10px]"></i> {tx('step4.badge.errorMobile')}
		</span>
	</div>

	<!-- Overall Progress — desktop only -->
	<div class="hidden lg:block bg-navy-main/60 rounded-xl p-4 border border-red-900/30">
		<div class="flex items-center justify-between mb-2">
			<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
			<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
		</div>
		<div class="w-full h-2.5 bg-navy-lighter rounded-full overflow-hidden">
			<div class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400" style="width:{overallProgress}%"></div>
		</div>
		<div class="flex items-center justify-between mt-2">
			<span class="text-[11px] text-text-muted">{tx('step3.progress.filesCompleted', { done: errorState?.filesCompleted ?? 0, total: errorState?.totalFiles ?? 0 })}</span>
			<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
				<i class="fa-solid fa-circle-xmark text-[9px]"></i> {tx('step4.error.processingFailed')}
			</span>
		</div>
	</div>

	<!-- File List -->
	<div class="flex flex-col gap-2 lg:max-h-[320px] lg:overflow-y-auto pr-1">
		{#each uploadedFiles as file}
			{@const fileStatus = getFileLogStatus(file.id)}
			{#if fileStatus === 'success'}
				<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-main/60 border border-brand-green/20 cursor-default">
					<div class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-green text-sm"></i>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-white truncate">{file.name}</p>
						<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
							<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
							<span class="w-1 h-1 rounded-full bg-gray-600"></span>
							<span class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1">
								<i class="fa-solid fa-circle-check text-[9px]"></i>
								{#if file.hasGps}
									<span class="hidden lg:inline">{tx('step3.files.gpsAndFieldsRemoved', { count: file.metadataFieldCount })}</span>
									<span class="inline lg:hidden">{tx('step3.files.gpsAndFieldsRemovedMobile', { count: file.metadataFieldCount })}</span>
								{:else}
									{file.metadataFieldCount} {tx('step3.files.fieldsRemoved')}
								{/if}
							</span>
						</div>
					</div>
					<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
						<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted">{file.extension}</span>
						<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
							<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
						</div>
					</div>
				</div>
			{:else if fileStatus === 'error'}
				<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-red/30 cursor-default bg-brand-red/5">
					<div class="w-9 h-9 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-red text-sm"></i>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-white truncate">{file.name}</p>
						<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
							<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
							<span class="w-1 h-1 rounded-full bg-gray-600"></span>
							<span class="text-[10px] lg:text-[11px] text-brand-red font-medium flex items-center gap-1">
								<i class="fa-solid fa-circle-xmark text-[9px]"></i>
								<span class="hidden lg:inline">{tx('step4.error.processingFailed')}</span>
								<span class="inline lg:hidden">{tx('step4.error.failedShort')}</span>
							</span>
						</div>
					</div>
					<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
						<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted">{file.extension}</span>
						<div class="w-6 h-6 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
							<i class="fa-solid fa-xmark text-brand-red text-[10px]"></i>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-main/60 border border-gray-800 cursor-default opacity-50">
					<div class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0">
						<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} text-brand-blue text-sm"></i>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-white truncate">{file.name}</p>
						<div class="flex items-center gap-1.5 lg:gap-2 mt-0.5">
							<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
							<span class="w-1 h-1 rounded-full bg-gray-600"></span>
							<span class="text-[10px] lg:text-[11px] text-text-muted flex items-center gap-1">
								<i class="fa-solid fa-ban text-[9px]"></i> {tx('step4.error.skipped')}
							</span>
						</div>
					</div>
					<span class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">{file.extension}</span>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3 mt-1">
		<a
			href="/step3"
			class="flex-1 py-3.5 rounded-xl bg-brand-green hover:bg-green-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-glow-green"
		>
			<i class="fa-solid fa-rotate-right"></i> {tx('step4.actions.tryAgain')}
		</a>
		<button class="px-4 lg:px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-text-muted font-semibold text-sm hover:bg-gray-800 hover:text-white transition-all flex items-center gap-2">
			<i class="fa-solid fa-trash"></i>
			<span class="hidden lg:inline">{tx('step4.actions.clearAll')}</span>
		</button>
	</div>
</div>

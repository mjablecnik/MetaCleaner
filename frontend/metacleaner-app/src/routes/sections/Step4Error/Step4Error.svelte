<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { cleaningResultsStore } from '$lib/stores/cleaningResultsStore.svelte';
	import type { QueuedFile } from '$lib/scanner/types';
	import ErrorBanner from './ErrorBanner.svelte';
	import ErrorFilesCard from './ErrorFilesCard.svelte';
	import type { FileWithErrorState } from './ErrorFilesCard.svelte';
	import ErrorStateCard from './ErrorStateCard.svelte';
	import type { ErrorType, SimpleLogEntry } from './ErrorStateCard.svelte';
	import ErrorDetailAccordion from './ErrorDetailAccordion.svelte';
	import ErrorTypeAccordion from './ErrorTypeAccordion.svelte';
	import ErrorLogAccordion from './ErrorLogAccordion.svelte';

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	let bannerVisible = $state(true);
	let selectedErrorType = $state<ErrorType>('cleaning');

	function computeFileStates(files: QueuedFile[], failedId?: string): FileWithErrorState[] {
		let seenFailed = false;
		return files.map((file) => {
			if (file.id === failedId) {
				seenFailed = true;
				return { file, status: 'error', fieldsRemoved: 0, gpsRemoved: false };
			} else if (seenFailed) {
				return { file, status: 'skipped', fieldsRemoved: 0, gpsRemoved: false };
			} else {
				return {
					file,
					status: 'done',
					fieldsRemoved: file.scanResult?.fieldCount ?? 0,
					gpsRemoved: file.scanResult?.hasGps ?? false
				};
			}
		});
	}

	function computeLogEntries(
		filesWithState: FileWithErrorState[],
		errorCode?: string
	): SimpleLogEntry[] {
		return filesWithState
			.filter((item) => item.status !== 'skipped')
			.map((item) => {
				if (item.status === 'done') {
					const text = item.gpsRemoved
						? `✓ ${item.file.name} — ${tx('step3.files.gpsAndFieldsRemoved', { count: item.fieldsRemoved })}`
						: `✓ ${item.file.name} — ${item.fieldsRemoved} ${tx('step3.files.fieldsRemoved')}`;
					return { text, isError: false };
				} else {
					const code = errorCode ?? 'ERR';
					return { text: `✗ ${item.file.name} — ${code}`, isError: true };
				}
			});
	}

	const errorData = $derived(cleaningResultsStore.error);

	const filesWithState = $derived(
		computeFileStates(scannerStore.files, cleaningResultsStore.error?.fileId)
	);

	const doneCount = $derived(filesWithState.filter((f) => f.status === 'done').length);
	const totalFiles = $derived(scannerStore.files.length);
	const overallProgress = $derived(totalFiles > 0 ? Math.round((doneCount / totalFiles) * 100) : 0);

	const logEntries = $derived(computeLogEntries(filesWithState, cleaningResultsStore.error?.code));

	function tryAgain() {
		appState.transitionTo('files-ready');
	}

	function clearAll() {
		appState.reset();
	}
</script>

<!-- Error badge -->
<div class="mb-2 flex items-center justify-end">
	<!-- Desktop badge -->
	<div
		class="hidden items-center gap-2 rounded-xl border border-red-800/50 bg-navy-card px-4 py-2.5 lg:flex"
	>
		<div class="h-2 w-2 rounded-full bg-brand-red"></div>
		<span class="text-xs font-semibold text-brand-red">{tx('step4.badge.errorDesktop')}</span>
	</div>
	<!-- Mobile badge -->
	<div
		class="flex items-center gap-1.5 rounded-xl border border-red-800/50 bg-navy-card px-3 py-2 lg:hidden"
	>
		<div class="h-2 w-2 rounded-full bg-brand-red"></div>
		<span class="text-[11px] font-semibold text-brand-red">{tx('step4.badge.errorMobile')}</span>
	</div>
</div>

<!-- Error Banner -->
{#if bannerVisible && errorData}
	<ErrorBanner
		code={errorData.code}
		description={tx('step4.error.descriptionDesktop')}
		onDismiss={() => (bannerVisible = false)}
	/>
{/if}

<!-- Mobile-only: error visual card + file list + accordions -->
<div class="flex flex-col gap-4 lg:hidden">
	{#if errorData}
		<!-- Mobile error visual card -->
		<div
			class="flex flex-col items-center gap-3 rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card"
		>
			<div class="relative mt-1 flex items-center justify-center">
				<div class="pulse-ring absolute h-20 w-20 rounded-full border-2 border-brand-red/20"></div>
				<div
					class="shake flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-red/40 bg-brand-red/10"
				>
					<i class="fa-solid fa-triangle-exclamation text-3xl text-brand-red"></i>
				</div>
				<div
					class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red"
				>
					<i class="fa-solid fa-xmark text-[9px] text-white"></i>
				</div>
			</div>
			<div class="text-center">
				<p class="text-sm font-bold text-white">{tx('step4.error.cleaningFailed')}</p>
				{#if errorData.fileName}
					<p class="mt-1 text-xs leading-relaxed text-text-muted">
						{tx('step4.detail.file')}
						<span class="font-semibold text-brand-red">{errorData.fileName}</span>
						{tx('step4.error.couldNotProcess')}.
					</p>
				{/if}
			</div>
			<!-- Mobile progress bar inside visual card -->
			<div class="w-full rounded-xl border border-red-900/30 bg-navy-main/60 p-3">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
					<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-navy-lighter">
					<div
						class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400"
						style="width: {overallProgress}%"
					></div>
				</div>
				<div class="mt-2 flex items-center justify-between">
					<span class="text-[11px] text-text-muted">
						{doneCount} / {totalFiles}
					</span>
					<span class="flex items-center gap-1 text-[11px] font-medium text-brand-red">
						<i class="fa-solid fa-circle-xmark text-[9px]"></i>
						{tx('step4.error.failedShort')}
					</span>
				</div>
			</div>
		</div>
	{/if}

	<ErrorFilesCard
		{filesWithState}
		{doneCount}
		{totalFiles}
		{overallProgress}
		onTryAgain={tryAgain}
		onClearAll={clearAll}
	/>

	{#if errorData}
		<ErrorDetailAccordion error={errorData} />
		<ErrorTypeAccordion
			{selectedErrorType}
			onSelectErrorType={(type) => (selectedErrorType = type)}
		/>
		<ErrorLogAccordion {logEntries} />
	{/if}
</div>

<!-- Desktop: two-column grid -->
<div class="hidden gap-6 lg:grid lg:grid-cols-[55%_43%]">
	<!-- Left: files card -->
	<div class="flex flex-col gap-5">
		<ErrorFilesCard
			{filesWithState}
			{doneCount}
			{totalFiles}
			{overallProgress}
			onTryAgain={tryAgain}
			onClearAll={clearAll}
		/>
	</div>

	<!-- Right: error state card -->
	<div class="flex flex-col gap-5">
		{#if errorData}
			<ErrorStateCard
				error={errorData}
				{selectedErrorType}
				onSelectErrorType={(type) => (selectedErrorType = type)}
				{logEntries}
			/>
		{/if}
	</div>
</div>

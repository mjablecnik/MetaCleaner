<script lang="ts">
	import { onMount } from 'svelte';
	import type { QueuedFile } from '$lib/scanner/types';
	import type {
		ProcessingResults,
		FileMetadataResult
	} from '$lib/types/processing';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { cleaningStore } from '$lib/api/cleaningStore.svelte';
	import { downloadFile, FileExpiredError } from '$lib/api/client';
	import FileResultItem from '../components/FileResultItem.svelte';

	interface Props {
		results: ProcessingResults | null;
		uploadedFiles: QueuedFile[];
		onStartOver: () => void;
	}

	const { results, uploadedFiles, onStartOver }: Props = $props();

	function getMockResult(index: number): FileMetadataResult | undefined {
		return results?.fileResults[index];
	}

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const reportId = $derived(cleaningStore.reportId);
	const reportHref = $derived(
		reportId ? resolve(`/report/${reportId}` as Pathname) : resolve('/reports')
	);

	// Expiration countdown: files are retained for 1 hour after completion
	const FILE_RETENTION_MS = 60 * 60 * 1000;
	let secondsRemaining = $state<number | null>(null);
	let filesExpired = $state(false);
	let downloadError = $state<string | null>(null);
	let countdownTimer: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		const completedAtMs = cleaningStore.completedAtMs;
		if (!completedAtMs) return;

		const completedTime = completedAtMs;

		function updateCountdown() {
			const elapsed = Date.now() - completedTime;
			const remaining = Math.max(0, FILE_RETENTION_MS - elapsed);
			secondsRemaining = Math.floor(remaining / 1000);
			filesExpired = remaining === 0;
			if (remaining === 0 && countdownTimer) {
				clearInterval(countdownTimer);
				countdownTimer = null;
			}
		}

		updateCountdown();
		countdownTimer = setInterval(updateCountdown, 1000);

		return () => {
			if (countdownTimer) clearInterval(countdownTimer);
		};
	});

	function formatCountdown(secs: number): string {
		const h = Math.floor(secs / 3600);
		const m = Math.floor((secs % 3600) / 60);
		const s = secs % 60;
		if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	async function downloadSingleFile(file: QueuedFile) {
		const serverId = cleaningStore.fileMappings.find((m) => m.scannerFile.id === file.id)?.serverId;
		if (!serverId) return;

		downloadError = null;
		try {
			const { blob, filename } = await downloadFile(serverId);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			if (err instanceof FileExpiredError) {
				filesExpired = true;
				downloadError = 'Files have expired. Please process your files again.';
			} else {
				downloadError = 'Download failed. The backend may be unavailable.';
			}
		}
	}

	async function downloadAll() {
		for (const file of uploadedFiles) {
			await downloadSingleFile(file);
		}
	}
</script>

<!-- File Results Card -->
<div
	class="fade-in-up flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card delay-3 lg:p-6"
>
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step5.results.title')}</h3>
		<span
			class="flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-brand-green uppercase lg:px-3"
		>
			<i class="fa-solid fa-circle-check text-[10px]"></i>
			{tx('step5.results.allDone')}
		</span>
	</div>

	{#if filesExpired}
		<div class="flex items-center gap-2 rounded-lg border border-red-700/50 bg-brand-red/10 px-3 py-2 text-xs text-brand-red">
			<i class="fa-solid fa-triangle-exclamation"></i>
			<span>Files have expired and can no longer be downloaded. Please process your files again.</span>
		</div>
	{:else if downloadError}
		<div class="flex items-center gap-2 rounded-lg border border-red-700/50 bg-brand-red/10 px-3 py-2 text-xs text-brand-red">
			<i class="fa-solid fa-triangle-exclamation"></i>
			<span>{downloadError}</span>
		</div>
	{:else if secondsRemaining !== null && secondsRemaining < 600}
		<div class="flex items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-900/20 px-3 py-2 text-xs text-amber-400">
			<i class="fa-solid fa-clock"></i>
			<span>Files expire in <strong>{formatCountdown(secondsRemaining)}</strong>. Download them now.</span>
		</div>
	{:else if secondsRemaining !== null}
		<div class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-main/40 px-3 py-2 text-xs text-text-muted">
			<i class="fa-solid fa-clock"></i>
			<span>Files available for <strong>{formatCountdown(secondsRemaining)}</strong> more.</span>
		</div>
	{/if}

	<!-- Files Grid -->
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		{#each uploadedFiles as file, i (file.id)}
			{@const mockResult = getMockResult(i)}
			<FileResultItem {file} result={mockResult} />
		{/each}
	</div>

	<!-- Desktop Action Buttons -->
	<div class="mt-1 hidden gap-3 lg:flex">
		<button
			onclick={downloadAll}
			disabled={filesExpired}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
		>
			<i class="fa-solid fa-download"></i>
			{tx('step5.actions.downloadAll')}
		</button>
		<a
			href={reportHref}
			class="flex items-center gap-2 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-5 py-3.5 text-sm font-semibold text-brand-blue transition-all hover:bg-brand-blue/20"
		>
			<i class="fa-solid fa-file-lines"></i>
			{tx('step5.actions.viewReport')}
		</a>
		<button
			onclick={onStartOver}
			class="flex items-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter px-5 py-3.5 text-sm font-semibold text-text-muted transition-all hover:bg-gray-800 hover:text-white"
		>
			<i class="fa-solid fa-arrow-up-from-bracket"></i>
			{tx('step5.actions.new')}
		</button>
	</div>
</div>

<!-- Mobile Sticky Bottom CTA -->
<div
	class="fixed right-0 bottom-0 left-0 z-50 flex flex-col gap-2 border-t border-gray-800 bg-navy-main/95 px-4 py-3 backdrop-blur lg:hidden"
>
	<button
		onclick={downloadAll}
		disabled={filesExpired}
		class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
	>
		<i class="fa-solid fa-download"></i>
		{tx('step5.actions.downloadAll')}
	</button>
	<div class="flex gap-2">
		<a
			href={reportHref}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-blue/30 bg-brand-blue/10 py-3 text-sm font-semibold text-brand-blue transition-transform active:scale-95"
		>
			<i class="fa-solid fa-file-lines"></i>
			{tx('step5.actions.viewReport')}
		</a>
		<a
			href={resolve('/reports' as Pathname)}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-text-muted transition-transform active:scale-95"
		>
			<i class="fa-solid fa-clock-rotate-left"></i>
			{tx('step5.actions.history')}
		</a>
		<button
			onclick={onStartOver}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-white transition-transform active:scale-95"
		>
			<i class="fa-solid fa-arrow-up-from-bracket text-text-muted"></i>
			{tx('step5.actions.new')}
		</button>
	</div>
</div>

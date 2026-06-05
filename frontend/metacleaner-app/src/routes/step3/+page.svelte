<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import { uploadFiles, createJob, connectJobProgress, getJobStatus } from '$lib/api/client';
	import { cleaningStore } from '$lib/api/cleaningStore.svelte';
	import MobileStatusCard from './sections/MobileStatusCard.svelte';
	import ProcessingFilesCard from './sections/ProcessingFilesCard.svelte';
	import ProcessingStatusCard from './sections/ProcessingStatusCard.svelte';
	import ActivityLogAccordion from './sections/ActivityLogAccordion.svelte';

	$effect(() => {
		if (!scannerStore.hasFiles) goto(resolve('/' as Pathname), { replaceState: true });
	});

	const uploadedFiles = $derived(scannerStore.files);

	// Mirror cleaning store state into local reactive bindings for child components
	const processingState = $derived(cleaningStore.processingState);
	const overallPct = $derived(cleaningStore.overallPct);
	const currentFile = $derived(uploadedFiles.find((f) => f.id === processingState?.currentFileId));

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	onMount(() => {
		let ws: WebSocket | null = null;
		let pollingTimer: ReturnType<typeof setInterval> | null = null;

		function startPolling(jid: string) {
			let pollCount = 0;
			const MAX_POLLS = 10;
			pollingTimer = setInterval(async () => {
				pollCount++;
				try {
					const status = await getJobStatus(jid);
					if (status.status === 'completed') {
						clearInterval(pollingTimer!);
						pollingTimer = null;
						if (cleaningStore.phase !== 'completed') {
							goto(resolve('/step5' as Pathname), { replaceState: false });
						}
					} else if (status.status === 'failed' || pollCount >= MAX_POLLS) {
						clearInterval(pollingTimer!);
						pollingTimer = null;
						cleaningStore.setError('ERR_JOB_FAILED', 'Job processing failed', null);
						goto(resolve('/step4' as Pathname), { replaceState: false });
					}
				} catch {
					if (pollCount >= MAX_POLLS) {
						clearInterval(pollingTimer!);
						pollingTimer = null;
						cleaningStore.setError('ERR_WS_CLOSED', 'Connection lost', null);
						goto(resolve('/step4' as Pathname), { replaceState: false });
					}
				}
			}, 3000);
		}

		async function startCleaning() {
			const files = scannerStore.files;
			if (!files.length) return;

			cleaningStore.startUpload(files);

			let serverFiles;
			try {
				serverFiles = await uploadFiles(files.map((f) => f.file));
			} catch (err) {
				cleaningStore.setUploadError(err instanceof Error ? err.message : 'Upload failed');
				goto(resolve('/step4' as Pathname), { replaceState: false });
				return;
			}

			cleaningStore.setFileMappings(serverFiles, files);

			let jobResp;
			try {
				jobResp = await createJob(serverFiles.map((f) => f.id));
			} catch (err) {
				cleaningStore.setUploadError(err instanceof Error ? err.message : 'Job creation failed');
				goto(resolve('/step4' as Pathname), { replaceState: false });
				return;
			}

			cleaningStore.initJob(jobResp.jobId);

			ws = connectJobProgress(
				jobResp.jobId,
				(event) => {
					cleaningStore.handleWsEvent(event);

					if (event.type === 'job_complete') {
						goto(resolve('/step5' as Pathname), { replaceState: false });
					} else if (event.type === 'file_error') {
						// A single file error does not necessarily terminate the job — wait for job_complete
					}
				},
				() => {
					// WS closed before job_complete — poll GET /api/jobs/{id} instead of immediate error
					if (cleaningStore.phase !== 'completed') {
						startPolling(jobResp.jobId);
					}
				},
				() => {
					// WS error — poll for job status instead of immediate error
					if (cleaningStore.phase !== 'completed') {
						startPolling(jobResp.jobId);
					}
				}
			);
		}

		void startCleaning();

		return () => {
			ws?.close();
			if (pollingTimer) clearInterval(pollingTimer);
		};
	});
</script>

<svelte:head>
	<title>{tx('step3.meta.title')}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-24 lg:mt-0 lg:gap-6 lg:px-6"
>
	<!-- Page Header -->
	<div class="mb-0 flex flex-col gap-1 lg:mb-2">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-white lg:text-3xl">{tx('step1.header.title')}</h1>
				<p class="mt-1 text-sm text-text-muted">
					{tx('step1.header.description')}
				</p>
			</div>
			<div
				class="flex items-center gap-2 self-start rounded-xl border border-blue-800/50 bg-navy-card px-3 py-2 sm:self-auto lg:px-4 lg:py-2.5"
			>
				{#if cleaningStore.phase === 'uploading'}
					<div class="h-2 w-2 animate-pulse rounded-full bg-brand-orange"></div>
					<span class="text-[10px] font-semibold text-brand-orange lg:text-xs">
						{tx('step3.badge.uploading') || 'Uploading...'}
					</span>
				{:else}
					<div class="h-2 w-2 animate-pulse rounded-full bg-brand-blue"></div>
					<span class="text-[10px] font-semibold text-brand-blue lg:text-xs">
						<span class="hidden lg:inline">{tx('step3.badge.inProgressDesktop')}</span>
						<span class="inline lg:hidden">{tx('step3.badge.inProgressMobile')}</span>
					</span>
				{/if}
			</div>
		</div>
	</div>

	{#if cleaningStore.phase === 'uploading'}
		<div class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6">
			<div class="flex items-center gap-3">
				<i class="fa-solid fa-circle-notch spin-slow text-brand-orange text-xl"></i>
				<div>
					<p class="text-sm font-semibold text-white">{tx('step3.upload.title') || 'Uploading files...'}</p>
					<p class="mt-0.5 text-xs text-text-muted">
						{tx('step3.upload.description') || 'Preparing your files for cleaning. This may take a moment for large files.'}
					</p>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				{#each uploadedFiles as file (file.id)}
					<div class="flex items-center gap-3 rounded-lg border border-gray-800 bg-navy-main/60 px-3 py-2">
						<i class="fa-solid fa-file text-xs text-text-muted"></i>
						<span class="min-w-0 flex-1 truncate text-xs text-text-muted">{file.name}</span>
						<i class="fa-solid fa-circle-notch spin-slow text-[10px] text-brand-orange"></i>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<MobileStatusCard {processingState} {currentFile} />

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-6">
			<ProcessingFilesCard {processingState} {uploadedFiles} {overallPct} />
			<ProcessingStatusCard {processingState} {uploadedFiles} {currentFile} />
		</div>

		<ActivityLogAccordion {processingState} {uploadedFiles} />
	{/if}
</main>

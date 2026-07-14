<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { cleaningResultsStore } from '$lib/stores/cleaningResultsStore.svelte';
	import { apiCleaningService } from '$lib/services/apiCleaningService';
	import type { CleaningJob } from '$lib/services/cleaningService';
	import type { ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';
	import ProcessingFilesCard from './ProcessingFilesCard.svelte';
	import type { FileWithState } from './ProcessingFilesCard.svelte';
	import ProcessingStatusCard from './ProcessingStatusCard.svelte';
	import MobileStatusCard from './MobileStatusCard.svelte';
	import ActivityLogAccordion from './ActivityLogAccordion.svelte';

	interface FileProcessState {
		status: 'waiting' | 'in_progress' | 'done' | 'error';
		progress: number;
		fieldsRemoved: number;
		gpsRemoved: boolean;
	}

	interface InternalLogEntry {
		fileId: string;
		timestamp: string;
		text: string;
		status: 'success' | 'in_progress' | 'waiting';
	}

	let overallProgress = $state(0);
	let filesCompleted = $state(0);
	let totalFiles = $state(0);
	let fieldsRemoved = $state(0);
	let timeRemainingSeconds = $state(0);
	let currentFileName = $state('');

	let fileProcessStates = $state<Record<string, FileProcessState>>({});
	let internalLog = $state<InternalLogEntry[]>([]);

	let job: CleaningJob | null = null;
	let startProgressForCurrentFile = 0;

	const processedFiles = $derived<FileWithState[]>(
		scannerStore.files.map((file) => ({
			file,
			state: fileProcessStates[file.id] ?? {
				status: 'waiting' as const,
				progress: 0,
				fieldsRemoved: 0,
				gpsRemoved: false
			}
		}))
	);

	const logEntries = $derived<ActivityLogEntry[]>(
		internalLog.map((e) => ({ timestamp: e.timestamp, text: e.text, status: e.status }))
	);

	function nowTime(): string {
		return new Date().toTimeString().slice(0, 8);
	}

	onMount(() => {
		const files = scannerStore.files;

		if (files.length === 0) {
			appState.transitionTo('idle');
			return;
		}

		// On mobile, scroll to top so the progress is visible in the first half of the screen
		if (window.innerWidth < 1024) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}

		totalFiles = files.length;

		// Build a name→clientId map so we can resolve server-side fileIds back to
		// client-side scanner IDs (they differ because the backend assigns its own UUIDs).
		const nameToClientId = new Map<string, string>();
		// Track server→client ID mapping as we discover them via onFileStart
		const serverToClientId = new Map<string, string>();
		for (const file of files) {
			nameToClientId.set(file.name, file.id);
			fileProcessStates[file.id] = {
				status: 'waiting',
				progress: 0,
				fieldsRemoved: 0,
				gpsRemoved: false
			};
		}

		internalLog = files.map((file) => ({
			fileId: file.id,
			timestamp: '—',
			text: `${file.name} — ${tx('step3.log.waiting')}`,
			status: 'waiting' as const
		}));

		// Helper: resolve server fileId to client fileId via fileName lookup
		function resolveClientId(serverFileId: string, fileName: string): string {
			// Check cache first
			const cached = serverToClientId.get(serverFileId);
			if (cached) return cached;
			// Direct match (same id) — unlikely but handle it
			if (files.some((f) => f.id === serverFileId)) {
				serverToClientId.set(serverFileId, serverFileId);
				return serverFileId;
			}
			// Match via file name
			const clientId = nameToClientId.get(fileName) ?? serverFileId;
			serverToClientId.set(serverFileId, clientId);
			return clientId;
		}

		job = apiCleaningService.startCleaning(
			files,
			{ removeGps: true, removeExif: true, removeXmp: true, removeComments: true },
			{
				onProgress(overall, done, total, fields, timeRemaining) {
					overallProgress = overall;
					filesCompleted = done;
					totalFiles = total;
					fieldsRemoved = fields;
					timeRemainingSeconds = timeRemaining;

					// Estimate in-progress file's individual progress
					if (total > 0) {
						const slotSize = 100 / total;
						const elapsed = overall - startProgressForCurrentFile;
						const fileProgress = Math.min(99, Math.round((elapsed / slotSize) * 100));
						const inProgressId = Object.entries(fileProcessStates).find(
							([, s]) => s.status === 'in_progress'
						)?.[0];
						if (inProgressId) {
							fileProcessStates[inProgressId].progress = fileProgress;
						}
					}
				},
				onFileStart(fileId, fileName) {
					currentFileName = fileName;
					startProgressForCurrentFile = overallProgress;
					const clientId = resolveClientId(fileId, fileName);
					fileProcessStates[clientId] = {
						status: 'in_progress',
						progress: 0,
						fieldsRemoved: 0,
						gpsRemoved: false
					};
					const idx = internalLog.findIndex((e) => e.fileId === clientId);
					if (idx !== -1) {
						internalLog[idx] = {
							fileId: clientId,
							timestamp: nowTime(),
							text: `${fileName} — ${tx('step3.log.inProgress', { pct: 0 })}`,
							status: 'in_progress'
						};
					}
				},
				onFileComplete(fileId, fields, gpsRemoved) {
					// Resolve server fileId → client fileId using the mapping built in onFileStart
					const clientId = serverToClientId.get(fileId) ?? fileId;
					const clientFile = files.find((f) => f.id === clientId);
					const name = clientFile?.name ?? fileId;
					fileProcessStates[clientId] = {
						status: 'done',
						progress: 100,
						fieldsRemoved: fields,
						gpsRemoved
					};
					const detail = gpsRemoved
						? tx('step3.log.gpsSuccess', { count: fields })
						: `${fields} ${tx('step3.files.fieldsRemoved')}`;
					const idx = internalLog.findIndex((e) => e.fileId === clientId);
					if (idx !== -1) {
						internalLog[idx] = {
							fileId: clientId,
							timestamp: nowTime(),
							text: `✓ ${name} — ${detail}`,
							status: 'success'
						};
					}
				},
				onComplete(results) {
					overallProgress = 100;
					cleaningResultsStore.setResults(results, job?.jobId, job?.reportId);
					appState.transitionTo('success');
				},
				onError(error) {
					cleaningResultsStore.setError(error);
					appState.transitionTo('error');
				}
			}
		);
		return () => {
			job?.cancel();
		};
	});

	function stop() {
		job?.cancel();
		appState.transitionTo('files-ready');
	}
</script>

<!-- Processing badge -->
<div class="mb-2 flex items-center justify-end">
	<!-- Desktop badge -->
	<div
		class="hidden items-center gap-2 rounded-xl border border-blue-800/50 bg-navy-card px-4 py-2.5 lg:flex"
	>
		<div class="h-2 w-2 animate-pulse rounded-full bg-brand-blue"></div>
		<span class="text-xs font-semibold text-brand-blue">{tx('step3.badge.inProgressDesktop')}</span>
	</div>
	<!-- Mobile badge -->
	<div
		class="flex items-center gap-1.5 rounded-xl border border-blue-800/50 bg-navy-card px-3 py-2 lg:hidden"
	>
		<div class="h-2 w-2 animate-pulse rounded-full bg-brand-blue"></div>
		<span class="text-[11px] font-semibold text-brand-blue"
			>{tx('step3.badge.inProgressMobile')}</span
		>
	</div>
</div>

<!-- Mobile-only: compact status card + activity log accordion -->
<div class="flex flex-col gap-4 lg:hidden">
	<MobileStatusCard {currentFileName} {totalFiles} {fieldsRemoved} {filesCompleted} />
	<ActivityLogAccordion entries={logEntries} />
</div>

<!-- Main grid: files card (left/full) + status card (desktop right only) -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-[55%_43%] lg:gap-5">
	<ProcessingFilesCard
		{processedFiles}
		{overallProgress}
		{filesCompleted}
		{totalFiles}
		{timeRemainingSeconds}
		onStop={stop}
	/>

	<div class="hidden lg:flex lg:flex-col">
		<ProcessingStatusCard
			{currentFileName}
			{totalFiles}
			{fieldsRemoved}
			{filesCompleted}
			{logEntries}
		/>
	</div>
</div>

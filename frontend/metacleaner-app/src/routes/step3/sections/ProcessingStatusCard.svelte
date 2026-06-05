<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import ActivityLog, { type ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';
	import type { QueuedFile } from '$lib/scanner/types';
	import type { ProcessingState } from '$lib/repositories/processingRepository';
	import ProcessingVisual from '../components/ProcessingVisual.svelte';

	interface Props {
		processingState: ProcessingState | null;
		uploadedFiles: QueuedFile[];
		currentFile: QueuedFile | undefined;
	}

	const { processingState, uploadedFiles, currentFile }: Props = $props();

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

	const logEntries = $derived<ActivityLogEntry[]>(
		(processingState?.log ?? []).map((entry) => {
			const logFile = getFileById(entry.fileId);
			const logFileState = processingState?.files.find((f) => f.fileId === entry.fileId);
			let text: string;
			if (entry.status === 'success') {
				if (logFileState?.gpsRemoved) {
					text = `✓ ${logFile?.name ?? ''} — ${tx('step3.log.gpsSuccess', { count: logFileState.fieldsRemoved ?? 0 })}`;
				} else {
					text = `✓ ${logFile?.name ?? ''} — ${logFileState?.fieldsRemoved ?? 0} ${tx('step3.files.fieldsRemoved')} ${entry.detail ?? ''}`;
				}
			} else if (entry.status === 'in_progress') {
				text = `${logFile?.name ?? ''} — ${tx('step3.log.inProgress', { pct: logFileState?.progress ?? 0 })}`;
			} else {
				text = `${logFile?.name ?? ''} — ${tx('step3.log.waiting')}`;
			}
			return { timestamp: entry.timestamp, text, status: entry.status };
		})
	);
</script>

<div class="hidden flex-col gap-5 lg:flex">
	<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-white">{tx('step3.status.title')}</h3>
			<span
				class="flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-blue uppercase"
			>
				<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
				{tx('step3.status.inProgress')}
			</span>
		</div>

		<!-- Animated Processing Visual -->
		<div class="flex flex-col items-center justify-center gap-4 py-4">
			<ProcessingVisual size="lg" />
			<div class="text-center">
				<p class="text-base font-bold text-white">{tx('step3.status.cleaningInProgress')}</p>
				<p class="mt-1 text-xs text-text-muted">
					{tx('step3.status.processingFileLong', { filename: currentFile?.name ?? '' })}
				</p>
			</div>
		</div>

		<!-- Live Stats -->
		<div class="grid w-full grid-cols-3 gap-3">
			<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 text-center">
				<p class="text-xl font-black text-white">{processingState?.totalFiles ?? 0}</p>
				<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.files')}</p>
			</div>
			<div class="rounded-xl border border-brand-green/20 bg-navy-main/60 p-3 text-center">
				<p class="text-xl font-black text-brand-green">{processingState?.fieldsRemoved ?? 0}</p>
				<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.fieldsRemoved')}</p>
			</div>
			<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 text-center">
				<p class="text-xl font-black text-brand-blue">
					{processingState?.filesCompleted ?? 0}<span class="text-sm font-semibold"
						>/{processingState?.totalFiles ?? 0}</span
					>
				</p>
				<p class="mt-0.5 text-[10px] text-text-muted">{tx('step3.stats.done')}</p>
			</div>
		</div>

		<!-- Activity Log -->
		<div class="flex flex-col gap-1">
			<p class="mb-1 text-xs font-semibold tracking-wider text-text-muted uppercase">
				{tx('step3.log.title')}
			</p>
			<ActivityLog entries={logEntries} class="max-h-[160px]" />
		</div>
	</div>
</div>

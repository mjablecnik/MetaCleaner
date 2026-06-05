<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import ActivityLog, { type ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import type { ProcessingState } from '$lib/repositories/processingRepository';
	import ProcessingVisual from '../components/ProcessingVisual.svelte';

	interface Props {
		processingState: ProcessingState | null;
		uploadedFiles: UploadedFile[];
		currentFile: UploadedFile | undefined;
	}

	const { processingState, uploadedFiles, currentFile }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function getFileById(id: string): UploadedFile | undefined {
		return uploadedFiles.find((f) => f.id === id);
	}

	const logEntries = $derived<ActivityLogEntry[]>(
		(processingState?.log ?? []).map((entry) => {
			const logFile = getFileById(entry.fileId);
			const logFileState = processingState?.files.find((f) => f.fileId === entry.fileId);
			let text = '';
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

<div class="hidden lg:flex flex-col gap-5">
	<div class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-lg text-white">{tx('step3.status.title')}</h3>
			<span
				class="text-xs font-bold px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1.5"
			>
				<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
				{tx('step3.status.inProgress')}
			</span>
		</div>

		<!-- Animated Processing Visual -->
		<div class="flex flex-col items-center justify-center py-4 gap-4">
			<ProcessingVisual size="lg" />
			<div class="text-center">
				<p class="font-bold text-white text-base">{tx('step3.status.cleaningInProgress')}</p>
				<p class="text-text-muted text-xs mt-1">
					{tx('step3.status.processingFileLong', { filename: currentFile?.name ?? '' })}
				</p>
			</div>
		</div>

		<!-- Live Stats -->
		<div class="grid grid-cols-3 gap-3 w-full">
			<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800">
				<p class="text-xl font-black text-white">{processingState?.totalFiles ?? 0}</p>
				<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.files')}</p>
			</div>
			<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-brand-green/20">
				<p class="text-xl font-black text-brand-green">{processingState?.fieldsRemoved ?? 0}</p>
				<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.fieldsRemoved')}</p>
			</div>
			<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800">
				<p class="text-xl font-black text-brand-blue">
					{processingState?.filesCompleted ?? 0}<span class="text-sm font-semibold">/{processingState?.totalFiles ?? 0}</span>
				</p>
				<p class="text-[10px] text-text-muted mt-0.5">{tx('step3.stats.done')}</p>
			</div>
		</div>

		<!-- Activity Log -->
		<div class="flex flex-col gap-1">
			<p class="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
				{tx('step3.log.title')}
			</p>
			<ActivityLog entries={logEntries} class="max-h-[160px]" />
		</div>
	</div>
</div>

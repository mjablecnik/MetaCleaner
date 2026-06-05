<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import AccordionCard from '$lib/shared/elements/AccordionCard.svelte';
	import ActivityLog, { type ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import type { ProcessingState } from '$lib/repositories/processingRepository';

	interface Props {
		processingState: ProcessingState | null;
		uploadedFiles: UploadedFile[];
	}

	const { processingState, uploadedFiles }: Props = $props();

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

<AccordionCard
	title={tx('step3.log.title')}
	icon="fa-solid fa-terminal"
	class="lg:hidden"
>
	<ActivityLog entries={logEntries} />
</AccordionCard>

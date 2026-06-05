<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import ActivityLog, { type ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';
	import type { ErrorState } from '$lib/repositories/processingRepository';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	interface Props {
		errorState: ErrorState | null;
		getFileById: (id: string) => UploadedFile | undefined;
		open?: boolean;
	}

	let { errorState, getFileById, open = $bindable(true) }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const logEntries = $derived<ActivityLogEntry[]>(
		(errorState?.log ?? []).map((logEntry) => {
			const file = getFileById(logEntry.fileId);
			if (logEntry.status === 'success') {
				const text = file?.hasGps
					? `✓ ${file?.name} — ${tx('step3.files.gpsAndFieldsRemovedMobile', { count: file.metadataFieldCount })}`
					: `✓ ${file?.name} — ${file?.metadataFieldCount} ${tx('step3.files.fieldsRemoved')}`;
				return { timestamp: logEntry.timestamp, text, status: 'success' as const };
			} else if (logEntry.status === 'error') {
				return {
					timestamp: logEntry.timestamp,
					text: `✗ ${file?.name} — ${logEntry.errorCode}`,
					status: 'error' as const
				};
			} else {
				return {
					timestamp: logEntry.timestamp,
					text: `${file?.name} — ${tx('step4.error.skipped').toLowerCase()}`,
					status: 'skipped' as const
				};
			}
		})
	);
</script>

<div class="overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card lg:hidden">
	<button onclick={() => (open = !open)} class="flex w-full items-center justify-between px-4 py-4">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-terminal text-sm text-text-muted"></i>
			<span class="text-sm font-semibold text-white">{tx('step4.log.title')}</span>
		</div>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform"
			style="transform: {open ? 'rotate(180deg)' : ''}"
		></i>
	</button>
	{#if open}
		<div class="px-4 pb-4">
			<ActivityLog entries={logEntries} />
		</div>
	{/if}
</div>

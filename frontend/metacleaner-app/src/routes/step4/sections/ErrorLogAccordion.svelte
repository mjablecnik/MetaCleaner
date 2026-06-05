<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
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
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
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
					status: 'error' as const,
				};
			} else {
				return {
					timestamp: logEntry.timestamp,
					text: `${file?.name} — ${tx('step4.error.skipped').toLowerCase()}`,
					status: 'skipped' as const,
				};
			}
		})
	);
</script>

<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
	<button
		onclick={() => (open = !open)}
		class="w-full flex items-center justify-between px-4 py-4"
	>
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-terminal text-text-muted text-sm"></i>
			<span class="font-semibold text-sm text-white">{tx('step4.log.title')}</span>
		</div>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
			style="transform: {open ? 'rotate(180deg)' : ''}"
		></i>
	</button>
	{#if open}
		<div class="px-4 pb-4">
			<ActivityLog entries={logEntries} />
		</div>
	{/if}
</div>

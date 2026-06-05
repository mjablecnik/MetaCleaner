<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import ActivityLog, { type ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';
	import type { ErrorState } from '$lib/repositories/processingRepository';
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import ErrorVisual from '../components/ErrorVisual.svelte';
	import ErrorDetailBox from '../components/ErrorDetailBox.svelte';
	import ErrorTypeSelector from '../components/ErrorTypeSelector.svelte';

	interface Props {
		errorState: ErrorState | null;
		failedFileName: string;
		selectedErrorType: string;
		onSelectType: (id: string) => void;
		getFileById: (id: string) => UploadedFile | undefined;
	}

	const { errorState, failedFileName, selectedErrorType, onSelectType, getFileById }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const logEntries = $derived<ActivityLogEntry[]>(
		(errorState?.log ?? []).map((logEntry) => {
			const file = getFileById(logEntry.fileId);
			if (logEntry.status === 'success') {
				const text = file?.hasGps
					? `✓ ${file?.name} — ${tx('step3.files.gpsAndFieldsRemoved', { count: file.metadataFieldCount })}`
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

<div class="hidden lg:flex flex-col gap-5">
	<div class="bg-navy-card rounded-2xl border border-gray-800 p-6 shadow-card flex flex-col gap-5">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-lg text-white">{tx('step1.status.title')}</h3>
			<span class="text-xs font-bold px-3 py-1 rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20 uppercase tracking-wider flex items-center gap-1.5">
				<i class="fa-solid fa-circle-xmark text-[10px]"></i> {tx('step4.badge.errorMobile')}
			</span>
		</div>

		<div class="flex flex-col items-center justify-center py-4 gap-4">
			<ErrorVisual size="lg" />
			<div class="text-center">
				<p class="font-bold text-white text-base">{tx('step4.error.cleaningFailed')}</p>
				<p class="text-text-muted text-xs mt-1 max-w-[220px] mx-auto leading-relaxed">
					{tx('step4.detail.file')} <span class="text-brand-red font-semibold">{failedFileName}</span> {tx('step4.error.couldNotProcess')}.
				</p>
			</div>
		</div>

		<ErrorDetailBox {errorState} {failedFileName} />

		<div class="flex flex-col gap-2">
			<p class="text-xs font-semibold text-text-muted uppercase tracking-wider">{tx('step4.type.title')}</p>
			<ErrorTypeSelector
				types={errorState?.errorTypes ?? []}
				selected={selectedErrorType}
				onSelect={onSelectType}
			/>
		</div>

		<div class="flex flex-col gap-1">
			<p class="text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">{tx('step4.log.title')}</p>
			<ActivityLog entries={logEntries} class="max-h-[130px]" />
		</div>
	</div>
</div>

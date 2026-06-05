<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import ActivityLog, { type ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';
	import type { ErrorState } from '$lib/repositories/processingRepository';
	import type { QueuedFile } from '$lib/scanner/types';
	import ErrorVisual from '../components/ErrorVisual.svelte';
	import ErrorDetailBox from '../components/ErrorDetailBox.svelte';
	import ErrorTypeSelector from '../components/ErrorTypeSelector.svelte';

	interface Props {
		errorState: ErrorState | null;
		failedFileName: string;
		selectedErrorType: string;
		onSelectType: (id: string) => void;
		getFileById: (id: string) => QueuedFile | undefined;
	}

	const { errorState, failedFileName, selectedErrorType, onSelectType, getFileById }: Props =
		$props();

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
			const hasGps = file?.scanResult?.hasGps ?? false;
			const fieldCount = file?.scanResult?.fieldCount ?? 0;
			if (logEntry.status === 'success') {
				const text = hasGps
					? `✓ ${file?.name} — ${tx('step3.files.gpsAndFieldsRemoved', { count: fieldCount })}`
					: `✓ ${file?.name} — ${fieldCount} ${tx('step3.files.fieldsRemoved')}`;
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

<div class="hidden flex-col gap-5 lg:flex">
	<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-white">{tx('step1.status.title')}</h3>
			<span
				class="flex items-center gap-1.5 rounded-full border border-brand-red/20 bg-brand-red/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-red uppercase"
			>
				<i class="fa-solid fa-circle-xmark text-[10px]"></i>
				{tx('step4.badge.errorMobile')}
			</span>
		</div>

		<div class="flex flex-col items-center justify-center gap-4 py-4">
			<ErrorVisual size="lg" />
			<div class="text-center">
				<p class="text-base font-bold text-white">{tx('step4.error.cleaningFailed')}</p>
				<p class="mx-auto mt-1 max-w-[220px] text-xs leading-relaxed text-text-muted">
					{tx('step4.detail.file')}
					<span class="font-semibold text-brand-red">{failedFileName}</span>
					{tx('step4.error.couldNotProcess')}.
				</p>
			</div>
		</div>

		<ErrorDetailBox {errorState} {failedFileName} />

		<div class="flex flex-col gap-2">
			<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">
				{tx('step4.type.title')}
			</p>
			<ErrorTypeSelector
				types={errorState?.errorTypes ?? []}
				selected={selectedErrorType}
				onSelect={onSelectType}
			/>
		</div>

		<div class="flex flex-col gap-1">
			<p class="mb-1 text-xs font-semibold tracking-wider text-text-muted uppercase">
				{tx('step4.log.title')}
			</p>
			<ActivityLog entries={logEntries} class="max-h-[130px]" />
		</div>
	</div>
</div>

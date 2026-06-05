<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/types/processing';
	import ErrorVisual from '../components/ErrorVisual.svelte';

	interface Props {
		errorState: ErrorState | null;
		failedFileName: string;
	}

	const { errorState, failedFileName }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const overallProgress = $derived(
		errorState ? Math.round((errorState.filesCompleted / errorState.totalFiles) * 100) : 0
	);
</script>

<div
	class="flex flex-col items-center gap-3 rounded-2xl border border-gray-800 bg-navy-card p-5 shadow-card lg:hidden"
>
	<div class="mt-1">
		<ErrorVisual size="sm" />
	</div>

	<div class="text-center">
		<p class="text-sm font-bold text-white">{tx('step4.error.cleaningFailed')}</p>
		<p class="mt-1 text-xs leading-relaxed text-text-muted">
			{tx('step4.detail.file')} <span class="font-semibold text-brand-red">{failedFileName}</span>
			{tx('step4.error.couldNotProcess')}.
		</p>
	</div>

	<div class="w-full rounded-xl border border-red-900/30 bg-navy-main/60 p-3">
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
			<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-navy-lighter">
			<div
				class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400"
				style="width:{overallProgress}%"
			></div>
		</div>
		<div class="mt-2 flex items-center justify-between">
			<span class="text-[11px] text-text-muted"
				>{tx('step3.progress.filesCompleted', {
					done: errorState?.filesCompleted ?? 0,
					total: errorState?.totalFiles ?? 0
				})}</span
			>
			<span class="flex items-center gap-1 text-[11px] font-medium text-brand-red">
				<i class="fa-solid fa-circle-xmark text-[9px]"></i>
				{tx('step4.error.failedShort')}
			</span>
		</div>
	</div>
</div>

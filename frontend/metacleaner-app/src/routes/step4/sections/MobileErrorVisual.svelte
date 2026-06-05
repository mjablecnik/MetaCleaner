<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/repositories/processingRepository';
	import ErrorVisual from '../components/ErrorVisual.svelte';

	interface Props {
		errorState: ErrorState | null;
		failedFileName: string;
	}

	const { errorState, failedFileName }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const overallProgress = $derived(
		errorState ? Math.round((errorState.filesCompleted / errorState.totalFiles) * 100) : 0
	);
</script>

<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 p-5 flex flex-col items-center gap-3 shadow-card">
	<div class="mt-1">
		<ErrorVisual size="sm" />
	</div>

	<div class="text-center">
		<p class="font-bold text-white text-sm">{tx('step4.error.cleaningFailed')}</p>
		<p class="text-text-muted text-xs mt-1 leading-relaxed">
			{tx('step4.detail.file')} <span class="text-brand-red font-semibold">{failedFileName}</span> {tx('step4.error.couldNotProcess')}.
		</p>
	</div>

	<div class="w-full bg-navy-main/60 rounded-xl p-3 border border-red-900/30">
		<div class="flex items-center justify-between mb-2">
			<span class="text-xs font-semibold text-text-muted">{tx('step3.progress.overall')}</span>
			<span class="text-xs font-bold text-brand-red">{tx('step4.error.interrupted')}</span>
		</div>
		<div class="w-full h-2 bg-navy-lighter rounded-full overflow-hidden">
			<div class="h-full rounded-full bg-gradient-to-r from-brand-red to-red-400" style="width:{overallProgress}%"></div>
		</div>
		<div class="flex items-center justify-between mt-2">
			<span class="text-[11px] text-text-muted">{tx('step3.progress.filesCompleted', { done: errorState?.filesCompleted ?? 0, total: errorState?.totalFiles ?? 0 })}</span>
			<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
				<i class="fa-solid fa-circle-xmark text-[9px]"></i> {tx('step4.error.failedShort')}
			</span>
		</div>
	</div>
</div>

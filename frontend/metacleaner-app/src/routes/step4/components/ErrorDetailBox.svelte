<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/repositories/processingRepository';

	interface Props {
		errorState: ErrorState | null;
		failedFileName: string;
	}

	const { errorState, failedFileName }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="bg-navy-main/80 rounded-xl border border-brand-red/20 p-4 flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<p class="text-xs font-semibold text-text-muted uppercase tracking-wider">{tx('step4.detail.title')}</p>
		<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/25 tracking-wider">{errorState?.errorCode}</span>
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex items-start gap-2.5">
			<i class="fa-solid fa-circle-info text-text-muted text-xs mt-0.5 flex-shrink-0"></i>
			<p class="text-xs text-text-muted leading-relaxed">{tx('step4.detail.description')}</p>
		</div>
		<div class="h-px bg-gray-800 my-1"></div>
		<div class="grid grid-cols-2 gap-2">
			<div class="flex flex-col gap-0.5">
				<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.errorCode')}</span>
				<span class="text-xs font-mono font-semibold text-white">{errorState?.errorHexCode}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.errorTime')}</span>
				<span class="text-xs font-mono font-semibold text-white">{errorState?.errorTime}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.file')}</span>
				<span class="text-xs font-mono font-semibold text-white truncate">{failedFileName}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-[10px] text-text-muted uppercase tracking-wider">{tx('step4.detail.phase')}</span>
				<span class="text-xs font-mono font-semibold text-white">{errorState?.phase}</span>
			</div>
		</div>
	</div>
</div>

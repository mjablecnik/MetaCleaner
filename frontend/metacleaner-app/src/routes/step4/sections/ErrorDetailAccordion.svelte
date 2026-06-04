<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/repositories/processingRepository';

	interface Props {
		errorState: ErrorState | null;
		failedFileName: string;
		open?: boolean;
	}

	let { errorState, failedFileName, open = $bindable(true) }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 shadow-card overflow-hidden">
	<button
		onclick={() => (open = !open)}
		class="w-full flex items-center justify-between px-4 py-4"
	>
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-circle-info text-brand-red text-sm"></i>
			<span class="font-semibold text-sm text-white">{tx('step4.detail.title')}</span>
			<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/25 tracking-wider">{errorState?.errorCode}</span>
		</div>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform"
			style="transform: {open ? 'rotate(180deg)' : ''}"
		></i>
	</button>
	{#if open}
		<div class="px-4 pb-4 flex flex-col gap-3">
			<div class="flex items-start gap-2">
				<i class="fa-solid fa-circle-info text-text-muted text-xs mt-0.5 flex-shrink-0"></i>
				<p class="text-xs text-text-muted leading-relaxed">{tx('step4.detail.description')}</p>
			</div>
			<div class="h-px bg-gray-800"></div>
			<div class="grid grid-cols-2 gap-3 pl-5">
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
	{/if}
</div>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/types/processing';

	interface Props {
		errorState: ErrorState | null;
		failedFileName: string;
		open?: boolean;
	}

	let { errorState, failedFileName, open = $bindable(true) }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card lg:hidden">
	<button onclick={() => (open = !open)} class="flex w-full items-center justify-between px-4 py-4">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-circle-info text-sm text-brand-red"></i>
			<span class="text-sm font-semibold text-white">{tx('step4.detail.title')}</span>
			<span
				class="rounded border border-brand-red/25 bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-red uppercase"
				>{errorState?.errorCode}</span
			>
		</div>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform"
			style="transform: {open ? 'rotate(180deg)' : ''}"
		></i>
	</button>
	{#if open}
		<div class="flex flex-col gap-3 px-4 pb-4">
			<div class="flex items-start gap-2">
				<i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
				<p class="text-xs leading-relaxed text-text-muted">{tx('step4.detail.description')}</p>
			</div>
			<div class="h-px bg-gray-800"></div>
			<div class="grid grid-cols-2 gap-3 pl-5">
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-text-muted uppercase"
						>{tx('step4.detail.errorCode')}</span
					>
					<span class="font-mono text-xs font-semibold text-white">{errorState?.errorHexCode}</span>
				</div>
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-text-muted uppercase"
						>{tx('step4.detail.errorTime')}</span
					>
					<span class="font-mono text-xs font-semibold text-white">{errorState?.errorTime}</span>
				</div>
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-text-muted uppercase"
						>{tx('step4.detail.file')}</span
					>
					<span class="truncate font-mono text-xs font-semibold text-white">{failedFileName}</span>
				</div>
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] tracking-wider text-text-muted uppercase"
						>{tx('step4.detail.phase')}</span
					>
					<span class="font-mono text-xs font-semibold text-white">{errorState?.phase}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

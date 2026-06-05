<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/repositories/processingRepository';

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
</script>

<div class="flex flex-col gap-3 rounded-xl border border-brand-red/20 bg-navy-main/80 p-4">
	<div class="flex items-center justify-between">
		<p class="text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('step4.detail.title')}
		</p>
		<span
			class="rounded border border-brand-red/25 bg-brand-red/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-red uppercase"
			>{errorState?.errorCode}</span
		>
	</div>
	<div class="flex flex-col gap-2">
		<div class="flex items-start gap-2.5">
			<i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
			<p class="text-xs leading-relaxed text-text-muted">{tx('step4.detail.description')}</p>
		</div>
		<div class="my-1 h-px bg-gray-800"></div>
		<div class="grid grid-cols-2 gap-2">
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
</div>

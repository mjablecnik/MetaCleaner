<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import type { ProcessingState } from '$lib/repositories/processingRepository';
	import ProcessingVisual from '../components/ProcessingVisual.svelte';

	interface Props {
		processingState: ProcessingState | null;
		currentFile: UploadedFile | undefined;
	}

	const { processingState, currentFile }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:hidden"
>
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white">{tx('step3.status.title')}</h3>
		<span
			class="flex items-center gap-1 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-brand-blue uppercase"
		>
			<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
			{tx('step3.status.inProgress')}
		</span>
	</div>

	<div class="flex items-center gap-4">
		<ProcessingVisual size="sm" />
		<div class="min-w-0 flex-1">
			<p class="text-sm font-bold text-white">{tx('step3.status.cleaningInProgress')}</p>
			<p class="mt-0.5 text-xs text-text-muted">
				{tx('step3.status.processingFile', { filename: currentFile?.name ?? '' })}
			</p>
		</div>
	</div>

	<!-- Live Stats -->
	<div class="grid w-full grid-cols-3 gap-2">
		<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-2.5 text-center">
			<p class="text-lg font-black text-white">{processingState?.totalFiles ?? 0}</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.files')}</p>
		</div>
		<div class="rounded-xl border border-brand-green/20 bg-navy-main/60 p-2.5 text-center">
			<p class="text-lg font-black text-brand-green">{processingState?.fieldsRemoved ?? 0}</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('step3.stats.fieldsDeleted')}</p>
		</div>
		<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-2.5 text-center">
			<p class="text-lg font-black text-brand-blue">
				{processingState?.filesCompleted ?? 0}<span class="text-xs font-semibold"
					>/{processingState?.totalFiles ?? 0}</span
				>
			</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('step3.stats.done')}</p>
		</div>
	</div>
</div>

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
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="lg:hidden bg-navy-card rounded-2xl border border-gray-800 p-4 shadow-card flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h3 class="font-semibold text-base text-white">{tx('step3.status.title')}</h3>
		<span
			class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider flex items-center gap-1"
		>
			<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i> {tx('step3.status.inProgress')}
		</span>
	</div>

	<div class="flex items-center gap-4">
		<ProcessingVisual size="sm" />
		<div class="flex-1 min-w-0">
			<p class="font-bold text-white text-sm">{tx('step3.status.cleaningInProgress')}</p>
			<p class="text-text-muted text-xs mt-0.5">
				{tx('step3.status.processingFile', { filename: currentFile?.name ?? '' })}
			</p>
		</div>
	</div>

	<!-- Live Stats -->
	<div class="grid grid-cols-3 gap-2 w-full">
		<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-gray-800">
			<p class="text-lg font-black text-white">{processingState?.totalFiles ?? 0}</p>
			<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.files')}</p>
		</div>
		<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-brand-green/20">
			<p class="text-lg font-black text-brand-green">{processingState?.fieldsRemoved ?? 0}</p>
			<p class="text-[10px] text-text-muted mt-0.5">{tx('step3.stats.fieldsDeleted')}</p>
		</div>
		<div class="bg-navy-main/60 rounded-xl p-2.5 text-center border border-gray-800">
			<p class="text-lg font-black text-brand-blue">
				{processingState?.filesCompleted ?? 0}<span class="text-xs font-semibold">/{processingState?.totalFiles ?? 0}</span>
			</p>
			<p class="text-[10px] text-text-muted mt-0.5">{tx('step3.stats.done')}</p>
		</div>
	</div>
</div>

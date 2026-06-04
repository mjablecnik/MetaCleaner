<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import Card from '$lib/shared/elements/Card.svelte';
	import ProgressBar from '$lib/shared/elements/ProgressBar.svelte';

	type Status = 'idle' | 'processing' | 'done';

	interface Props {
		status?: Status;
		progress?: number;
		filesCount?: number;
		fieldsRemovedCount?: number;
		processingTime?: string;
		onDownload?: () => void;
		onProcessMore?: () => void;
	}

	const {
		status = 'idle',
		progress = 0,
		filesCount = 0,
		fieldsRemovedCount = 0,
		processingTime = '0s',
		onDownload,
		onProcessMore,
	}: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<Card class="flex flex-col gap-4 lg:gap-5">
	<div class="flex items-center justify-between">
		<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.status.title')}</h3>
		<span class="text-[10px] lg:text-xs font-bold px-2.5 lg:px-3 py-1 rounded-full bg-navy-lighter text-text-muted uppercase tracking-wider">
			{tx('step1.status.waitingForFiles')}
		</span>
	</div>

	{#if status === 'idle'}
		<div class="flex flex-col items-center justify-center py-6 lg:py-8 gap-3 lg:gap-4">
			<div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-navy-lighter flex items-center justify-center">
				<i class="fa-solid fa-shield-halved text-3xl lg:text-4xl text-gray-700"></i>
			</div>
			<div class="text-center">
				<p class="text-text-muted text-sm">{tx('step1.status.uploadPrompt')}</p>
			</div>
		</div>

	{:else if status === 'processing'}
		<div class="flex flex-col gap-4 lg:gap-5">
			<div class="flex flex-col items-center gap-3 lg:gap-4 py-3 lg:py-4">
				<div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-brand-blue/10 border-2 border-brand-blue/30 flex items-center justify-center relative">
					<i class="fa-solid fa-gear text-brand-blue text-2xl lg:text-3xl spin-slow"></i>
				</div>
				<div class="text-center">
					<p class="font-semibold text-white text-sm">{tx('step1.status.processingFiles')}</p>
					<p class="text-xs text-text-muted mt-0.5 lg:mt-1">{tx('step1.status.removingMetadata')}</p>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<div class="flex justify-between text-xs text-text-muted mb-1 lg:mb-0">
					<span>{tx('step1.status.progress')}</span>
					<span>{progress}%</span>
				</div>
				<ProgressBar value={progress} color="blue" />
			</div>
		</div>

	{:else if status === 'done'}
		<div class="flex flex-col gap-3 lg:gap-4">
			<div class="flex flex-col items-center gap-3 py-3 lg:py-4">
				<div class="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-brand-green/10 border-2 border-brand-green/30 flex items-center justify-center">
					<i class="fa-solid fa-circle-check text-brand-green text-3xl lg:text-4xl"></i>
				</div>
				<div class="text-center">
					<p class="font-bold text-white text-lg">{tx('step1.status.done')}</p>
					<p class="text-xs text-text-muted mt-0.5 lg:mt-1">{tx('step1.status.allRemoved')}</p>
				</div>
			</div>
			<div class="grid grid-cols-3 gap-2 lg:gap-3">
				<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800">
					<p class="text-xl font-black text-white">{filesCount}</p>
					<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.files')}</p>
				</div>
				<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800">
					<p class="text-xl font-black text-brand-green">{fieldsRemovedCount}</p>
					<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.fieldsRemoved')}</p>
				</div>
				<div class="bg-navy-main/60 rounded-xl p-3 text-center border border-gray-800">
					<p class="text-xl font-black text-brand-blue">{processingTime}</p>
					<p class="text-[10px] text-text-muted mt-0.5">{tx('common.stats.time')}</p>
				</div>
			</div>
			<button
				onclick={onDownload}
				class="w-full py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-500 transition-all shadow-glow-green flex items-center justify-center gap-2"
			>
				<i class="fa-solid fa-download"></i>
				{tx('step1.actions.download')}
			</button>
			<button
				onclick={onProcessMore}
				class="w-full py-3 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
			>
				<i class="fa-solid fa-rotate-left"></i>
				{tx('step1.actions.processMore')}
			</button>
		</div>
	{/if}
</Card>

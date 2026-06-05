<script lang="ts">
	import { locale } from '$lib/locale.svelte';
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
		onProcessMore
	}: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<Card class="flex flex-col gap-4 lg:gap-5">
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.status.title')}</h3>
		<span
			class="rounded-full bg-navy-lighter px-2.5 py-1 text-[10px] font-bold tracking-wider text-text-muted uppercase lg:px-3 lg:text-xs"
		>
			{tx('step1.status.waitingForFiles')}
		</span>
	</div>

	{#if status === 'idle'}
		<div class="flex flex-col items-center justify-center gap-3 py-6 lg:gap-4 lg:py-8">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-navy-lighter lg:h-20 lg:w-20"
			>
				<i class="fa-solid fa-shield-halved text-3xl text-gray-700 lg:text-4xl"></i>
			</div>
			<div class="text-center">
				<p class="text-sm text-text-muted">{tx('step1.status.uploadPrompt')}</p>
			</div>
		</div>
	{:else if status === 'processing'}
		<div class="flex flex-col gap-4 lg:gap-5">
			<div class="flex flex-col items-center gap-3 py-3 lg:gap-4 lg:py-4">
				<div
					class="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-blue/30 bg-brand-blue/10 lg:h-20 lg:w-20"
				>
					<i class="fa-solid fa-gear spin-slow text-2xl text-brand-blue lg:text-3xl"></i>
				</div>
				<div class="text-center">
					<p class="text-sm font-semibold text-white">{tx('step1.status.processingFiles')}</p>
					<p class="mt-0.5 text-xs text-text-muted lg:mt-1">
						{tx('step1.status.removingMetadata')}
					</p>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<div class="mb-1 flex justify-between text-xs text-text-muted lg:mb-0">
					<span>{tx('step1.status.progress')}</span>
					<span>{progress}%</span>
				</div>
				<ProgressBar value={progress} color="blue" />
			</div>
		</div>
	{:else if status === 'done'}
		<div class="flex flex-col gap-3 lg:gap-4">
			<div class="flex flex-col items-center gap-3 py-3 lg:py-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-green/30 bg-brand-green/10 lg:h-20 lg:w-20"
				>
					<i class="fa-solid fa-circle-check text-3xl text-brand-green lg:text-4xl"></i>
				</div>
				<div class="text-center">
					<p class="text-lg font-bold text-white">{tx('step1.status.done')}</p>
					<p class="mt-0.5 text-xs text-text-muted lg:mt-1">{tx('step1.status.allRemoved')}</p>
				</div>
			</div>
			<div class="grid grid-cols-3 gap-2 lg:gap-3">
				<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 text-center">
					<p class="text-xl font-black text-white">{filesCount}</p>
					<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.files')}</p>
				</div>
				<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 text-center">
					<p class="text-xl font-black text-brand-green">{fieldsRemovedCount}</p>
					<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.fieldsRemoved')}</p>
				</div>
				<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 text-center">
					<p class="text-xl font-black text-brand-blue">{processingTime}</p>
					<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.time')}</p>
				</div>
			</div>
			<button
				onclick={onDownload}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500"
			>
				<i class="fa-solid fa-download"></i>
				{tx('step1.actions.download')}
			</button>
			<button
				onclick={onProcessMore}
				class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
			>
				<i class="fa-solid fa-rotate-left"></i>
				{tx('step1.actions.processMore')}
			</button>
		</div>
	{/if}
</Card>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		currentFileName: string;
		totalFiles: number;
		fieldsRemoved: number;
		filesCompleted: number;
	}

	const { currentFileName, totalFiles, fieldsRemoved, filesCompleted }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white">{tx('step3.status.title')}</h3>
		<span
			class="flex items-center gap-1 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-brand-blue uppercase"
		>
			<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
			{tx('step3.status.inProgress')}
		</span>
	</div>

	<!-- Compact animated icon + text (horizontal) -->
	<div class="flex items-center gap-4">
		<div class="relative flex flex-shrink-0 items-center justify-center">
			<div class="pulse-ring absolute h-16 w-16 rounded-full border-2 border-brand-blue/20"></div>
			<div
				class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-blue/40 bg-brand-blue/10"
			>
				<i class="fa-solid fa-shield-halved text-2xl text-brand-blue"></i>
			</div>
			<div
				class="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue"
			>
				<i class="fa-solid fa-circle-notch spin-slow text-[9px] text-white"></i>
			</div>
		</div>
		<div class="min-w-0 flex-1">
			<p class="text-sm font-bold text-white">{tx('step3.status.cleaningInProgress')}</p>
			{#if currentFileName}
				<p class="mt-0.5 text-xs text-text-muted">
					{tx('step3.status.processing')}
					<span class="font-semibold text-brand-blue">{currentFileName}</span>
				</p>
			{/if}
		</div>
	</div>

	<!-- Live Stats -->
	<div class="grid w-full grid-cols-3 gap-2">
		<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-2.5 text-center">
			<p class="text-lg font-black text-white">{totalFiles}</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.files')}</p>
		</div>
		<div class="rounded-xl border border-brand-green/20 bg-navy-main/60 p-2.5 text-center">
			<p class="text-lg font-black text-brand-green">{fieldsRemoved}</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('step3.stats.fieldsDeleted')}</p>
		</div>
		<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-2.5 text-center">
			<p class="text-lg font-black text-brand-blue">
				{filesCompleted}<span class="text-xs font-semibold">/{totalFiles}</span>
			</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('step3.stats.done')}</p>
		</div>
	</div>
</div>

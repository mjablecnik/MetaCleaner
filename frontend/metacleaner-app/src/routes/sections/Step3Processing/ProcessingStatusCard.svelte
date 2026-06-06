<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import ActivityLog from '$lib/shared/components/ActivityLog.svelte';
	import type { ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';

	interface Props {
		currentFileName: string;
		totalFiles: number;
		fieldsRemoved: number;
		filesCompleted: number;
		logEntries: ActivityLogEntry[];
	}

	const { currentFileName, totalFiles, fieldsRemoved, filesCompleted, logEntries }: Props =
		$props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-white">{tx('step3.status.title')}</h3>
		<span
			class="flex items-center gap-1.5 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-blue uppercase"
		>
			<i class="fa-solid fa-circle-notch spin-slow text-[10px]"></i>
			{tx('step3.status.inProgress')}
		</span>
	</div>

	<!-- Animated Processing Visual -->
	<div class="flex flex-col items-center justify-center gap-4 py-4">
		<div class="relative flex items-center justify-center">
			<div class="pulse-ring absolute h-24 w-24 rounded-full border-2 border-brand-blue/20"></div>
			<div
				class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-blue/40 bg-brand-blue/10"
			>
				<i class="fa-solid fa-shield-halved text-4xl text-brand-blue"></i>
			</div>
			<div
				class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue"
			>
				<i class="fa-solid fa-circle-notch spin-slow text-[10px] text-white"></i>
			</div>
		</div>
		<div class="text-center">
			<p class="text-base font-bold text-white">{tx('step3.status.cleaningInProgress')}</p>
			{#if currentFileName}
				<p class="mt-1 text-xs text-text-muted">
					{tx('step3.status.processingFileLong', { filename: '' })}<span
						class="font-semibold text-brand-blue">{currentFileName}</span
					>
				</p>
			{/if}
		</div>
	</div>

	<!-- Live Stats -->
	<div class="grid w-full grid-cols-3 gap-3">
		<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 text-center">
			<p class="text-xl font-black text-white">{totalFiles}</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('common.stats.files')}</p>
		</div>
		<div class="rounded-xl border border-brand-green/20 bg-navy-main/60 p-3 text-center">
			<p class="text-xl font-black text-brand-green">{fieldsRemoved}</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('step3.stats.fieldsDeleted')}</p>
		</div>
		<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 text-center">
			<p class="text-xl font-black text-brand-blue">
				{filesCompleted}<span class="text-sm font-semibold">/{totalFiles}</span>
			</p>
			<p class="mt-0.5 text-[10px] text-text-muted">{tx('step3.stats.done')}</p>
		</div>
	</div>

	<!-- Activity Log -->
	<div class="flex flex-col gap-1">
		<p class="mb-1 text-xs font-semibold tracking-wider text-text-muted uppercase">
			{tx('step3.log.title')}
		</p>
		<ActivityLog entries={logEntries} class="max-h-[160px]" />
	</div>
</div>

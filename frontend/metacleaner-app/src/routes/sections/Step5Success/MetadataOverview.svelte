<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { MetadataBreakdown } from '$lib/types/processing';

	interface Props {
		beforeBreakdown: MetadataBreakdown;
		totalFieldsBefore: number;
		gpsLocationsRemoved: number;
	}

	let { beforeBreakdown, totalFieldsBefore, gpsLocationsRemoved }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	let accordionOpen = $state(true);
	let activeTab = $state<'before' | 'after'>('before');
</script>

<!-- Desktop: full two-column card -->
<div
	class="fade-in-up hidden w-full flex-col gap-6 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card delay-2 lg:flex"
>
	<h3 class="text-lg font-semibold text-white">{tx('step5.metadata.title')}</h3>
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Before -->
		<div class="flex flex-col gap-4 rounded-2xl border border-brand-red/40 bg-navy-main/60 p-6">
			<div class="mb-2 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/20 text-brand-red"
				>
					<i class="fa-solid fa-triangle-exclamation"></i>
				</div>
				<div>
					<span class="text-xs font-bold tracking-wider text-brand-red uppercase"
						>{tx('step5.metadata.before')}</span
					>
					<p class="text-sm font-semibold text-white">{tx('step5.metadata.beforeDesc')}</p>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<div
					class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
				>
					<span class="flex items-center gap-2 text-xs text-text-muted"
						><i class="fa-solid fa-location-dot text-brand-red"></i>
						{tx('step5.metadata.gps')}</span
					>
					<span class="font-mono text-xs text-white"
						>{tx('step5.metadata.filesCount', { count: gpsLocationsRemoved })}</span
					>
				</div>
				<div
					class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
				>
					<span class="flex items-center gap-2 text-xs text-text-muted"
						><i class="fa-solid fa-camera text-brand-red"></i>
						{tx('step5.metadata.exif')}</span
					>
					<span class="font-mono text-xs text-white"
						>{tx('step5.metadata.fieldsCount', { count: beforeBreakdown.exifFields })}</span
					>
				</div>
				<div
					class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
				>
					<span class="flex items-center gap-2 text-xs text-text-muted"
						><i class="fa-solid fa-tag text-brand-red"></i>
						{tx('step5.metadata.xmp')}</span
					>
					<span class="font-mono text-xs text-white"
						>{tx('step5.metadata.fieldsCount', { count: beforeBreakdown.xmpFields })}</span
					>
				</div>
				{#if beforeBreakdown.id3mp4Fields > 0}
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-film text-brand-red"></i>
							{tx('step5.metadata.id3mp4')}</span
						>
						<span class="font-mono text-xs text-white"
							>{tx('step5.metadata.fieldsCount', { count: beforeBreakdown.id3mp4Fields })}</span
						>
					</div>
				{/if}
				{#if beforeBreakdown.otherFields > 0}
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-ellipsis text-brand-red"></i>
							{tx('step5.metadata.other')}</span
						>
						<span class="font-mono text-xs text-white"
							>{tx('step5.metadata.fieldsCount', { count: beforeBreakdown.otherFields })}</span
						>
					</div>
				{/if}
			</div>
			<p class="mt-1 flex items-center gap-2 text-xs text-brand-red/80">
				<i class="fa-solid fa-circle-exclamation"></i>
				{tx('step5.metadata.totalExposed', { count: totalFieldsBefore })}
			</p>
		</div>

		<!-- After -->
		<div class="flex flex-col gap-4 rounded-2xl border border-brand-green/40 bg-navy-main/60 p-6">
			<div class="mb-2 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/20 text-brand-green"
				>
					<i class="fa-solid fa-shield-halved"></i>
				</div>
				<div>
					<span class="text-xs font-bold tracking-wider text-brand-green uppercase"
						>{tx('step5.metadata.after')}</span
					>
					<p class="text-sm font-semibold text-white">{tx('step5.metadata.afterDesc')}</p>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<div
					class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
				>
					<span class="flex items-center gap-2 text-xs text-text-muted"
						><i class="fa-solid fa-location-dot text-brand-green"></i>
						{tx('step5.metadata.gps')}</span
					>
					<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
						><i class="fa-solid fa-check"></i>
						{tx('step5.metadata.removed')}</span
					>
				</div>
				<div
					class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
				>
					<span class="flex items-center gap-2 text-xs text-text-muted"
						><i class="fa-solid fa-camera text-brand-green"></i>
						{tx('step5.metadata.exif')}</span
					>
					<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
						><i class="fa-solid fa-check"></i>
						{tx('step5.metadata.removed')}</span
					>
				</div>
				<div
					class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
				>
					<span class="flex items-center gap-2 text-xs text-text-muted"
						><i class="fa-solid fa-tag text-brand-green"></i>
						{tx('step5.metadata.xmp')}</span
					>
					<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
						><i class="fa-solid fa-check"></i>
						{tx('step5.metadata.removed')}</span
					>
				</div>
				{#if beforeBreakdown.id3mp4Fields > 0}
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-film text-brand-green"></i>
							{tx('step5.metadata.id3mp4')}</span
						>
						<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
							><i class="fa-solid fa-check"></i>
							{tx('step5.metadata.removed')}</span
						>
					</div>
				{/if}
				{#if beforeBreakdown.otherFields > 0}
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-card px-4 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-ellipsis text-brand-green"></i>
							{tx('step5.metadata.other')}</span
						>
						<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
							><i class="fa-solid fa-check"></i>
							{tx('step5.metadata.removed')}</span
						>
					</div>
				{/if}
			</div>
			<p class="mt-1 flex items-center gap-2 text-xs text-brand-green/80">
				<i class="fa-solid fa-circle-check"></i>
				{tx('step5.metadata.allClean')}
			</p>
		</div>
	</div>
</div>

<!-- Mobile: accordion with tab switcher -->
<div
	class="fade-in-up overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card delay-2 lg:hidden"
>
	<button
		onclick={() => (accordionOpen = !accordionOpen)}
		class="flex min-h-[52px] w-full items-center justify-between px-5 py-4"
	>
		<span class="text-base font-semibold text-white">{tx('step5.metadata.title')}</span>
		<i
			class="fa-solid fa-chevron-down text-sm text-text-muted transition-transform"
			class:rotate-180={accordionOpen}
		></i>
	</button>

	{#if accordionOpen}
		<div class="flex flex-col gap-4 px-4 pb-5">
			<!-- Tab buttons -->
			<div class="flex gap-1 rounded-xl bg-navy-main/60 p-1">
				<button
					onclick={() => (activeTab = 'before')}
					class={activeTab === 'before'
						? 'flex-1 rounded-lg border border-brand-red/30 bg-brand-red/10 py-2 text-xs font-bold text-brand-red transition-all'
						: 'flex-1 rounded-lg bg-transparent py-2 text-xs font-bold text-text-muted transition-all'}
				>
					<i class="fa-solid fa-triangle-exclamation mr-1"></i>
					{tx('step5.metadata.before')}
				</button>
				<button
					onclick={() => (activeTab = 'after')}
					class={activeTab === 'after'
						? 'flex-1 rounded-lg border border-brand-green/30 bg-brand-green/10 py-2 text-xs font-bold text-brand-green transition-all'
						: 'flex-1 rounded-lg bg-transparent py-2 text-xs font-bold text-text-muted transition-all'}
				>
					<i class="fa-solid fa-shield-halved mr-1"></i>
					{tx('step5.metadata.after')}
				</button>
			</div>

			{#if activeTab === 'before'}
				<!-- Before panel -->
				<div class="flex flex-col gap-2">
					<p class="mb-1 text-xs font-semibold text-white">{tx('step5.metadata.beforeDesc')}</p>
					<div
						class="mb-1 flex items-center gap-2 rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2.5"
					>
						<i class="fa-solid fa-circle-exclamation flex-shrink-0 text-sm text-brand-red"></i>
						<p class="text-xs font-medium text-brand-red/90">
							{tx('step5.metadata.highRiskWarning', { count: totalFieldsBefore })}
						</p>
					</div>
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-location-dot text-brand-red"></i>
							{tx('step5.metadata.gps')}</span
						>
						<span class="font-mono text-xs text-white"
							>{tx('step5.metadata.filesCount', { count: gpsLocationsRemoved })}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-camera text-brand-red"></i>
							{tx('step5.metadata.exif')}</span
						>
						<span class="font-mono text-xs text-white"
							>{tx('step5.metadata.fieldsCount', { count: beforeBreakdown.exifFields })}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-tag text-brand-red"></i>
							{tx('step5.metadata.xmp')}</span
						>
						<span class="font-mono text-xs text-white"
							>{tx('step5.metadata.fieldsCount', { count: beforeBreakdown.xmpFields })}</span
						>
					</div>
					{#if beforeBreakdown.id3mp4Fields > 0}
						<div
							class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
						>
							<span class="flex items-center gap-2 text-xs text-text-muted"
								><i class="fa-solid fa-film text-brand-red"></i>
								{tx('step5.metadata.id3mp4')}</span
							>
							<span class="font-mono text-xs text-white"
								>{tx('step5.metadata.fieldsCount', {
									count: beforeBreakdown.id3mp4Fields
								})}</span
							>
						</div>
					{/if}
					{#if beforeBreakdown.otherFields > 0}
						<div
							class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
						>
							<span class="flex items-center gap-2 text-xs text-text-muted"
								><i class="fa-solid fa-ellipsis text-brand-red"></i>
								{tx('step5.metadata.other')}</span
							>
							<span class="font-mono text-xs text-white"
								>{tx('step5.metadata.fieldsCount', { count: beforeBreakdown.otherFields })}</span
							>
						</div>
					{/if}
					<!-- Risk bar -->
					<div class="mt-1">
						<div class="mb-1 flex justify-between text-[10px] text-text-muted">
							<span>{tx('step5.metadata.totalRisk')}</span>
							<span class="font-bold text-brand-red">{tx('step5.metadata.riskHigh')}</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-navy-main">
							<div
								class="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-orange"
								style="width: 92%"
							></div>
						</div>
					</div>
				</div>
			{:else}
				<!-- After panel -->
				<div class="flex flex-col gap-2">
					<p class="mb-1 text-xs font-semibold text-white">{tx('step5.metadata.afterDesc')}</p>
					<div
						class="mb-1 flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/10 px-3 py-2.5"
					>
						<i class="fa-solid fa-shield-halved flex-shrink-0 text-sm text-brand-green"></i>
						<p class="text-xs font-medium text-brand-green/90">
							{tx('step5.metadata.allRemovedSuccess')}
						</p>
					</div>
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-location-dot text-brand-green"></i>
							{tx('step5.metadata.gps')}</span
						>
						<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
							><i class="fa-solid fa-check"></i>
							{tx('step5.metadata.removed')}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-camera text-brand-green"></i>
							{tx('step5.metadata.exif')}</span
						>
						<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
							><i class="fa-solid fa-check"></i>
							{tx('step5.metadata.removed')}</span
						>
					</div>
					<div
						class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
					>
						<span class="flex items-center gap-2 text-xs text-text-muted"
							><i class="fa-solid fa-tag text-brand-green"></i>
							{tx('step5.metadata.xmp')}</span
						>
						<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
							><i class="fa-solid fa-check"></i>
							{tx('step5.metadata.removed')}</span
						>
					</div>
					{#if beforeBreakdown.id3mp4Fields > 0}
						<div
							class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
						>
							<span class="flex items-center gap-2 text-xs text-text-muted"
								><i class="fa-solid fa-film text-brand-green"></i>
								{tx('step5.metadata.id3mp4')}</span
							>
							<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
								><i class="fa-solid fa-check"></i>
								{tx('step5.metadata.removed')}</span
							>
						</div>
					{/if}
					{#if beforeBreakdown.otherFields > 0}
						<div
							class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5"
						>
							<span class="flex items-center gap-2 text-xs text-text-muted"
								><i class="fa-solid fa-ellipsis text-brand-green"></i>
								{tx('step5.metadata.other')}</span
							>
							<span class="flex items-center gap-1 font-mono text-xs text-brand-green"
								><i class="fa-solid fa-check"></i>
								{tx('step5.metadata.removed')}</span
							>
						</div>
					{/if}
					<!-- Risk bar after -->
					<div class="mt-1">
						<div class="mb-1 flex justify-between text-[10px] text-text-muted">
							<span>{tx('step5.metadata.totalRisk')}</span>
							<span class="font-bold text-brand-green">{tx('step5.metadata.riskNone')}</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-navy-main">
							<div class="h-full rounded-full bg-brand-green" style="width: 0%"></div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

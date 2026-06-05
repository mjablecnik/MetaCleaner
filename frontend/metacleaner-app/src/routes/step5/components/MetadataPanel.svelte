<script lang="ts">
	import type { MetadataBreakdown } from '$lib/repositories/processingRepository';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		type: 'before' | 'after';
		breakdown: MetadataBreakdown;
		totalFieldsRemoved: number;
	}

	const { type, breakdown, totalFieldsRemoved }: Props = $props();

	const isBefore = $derived(type === 'before');

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="flex flex-col gap-2 lg:gap-4 lg:rounded-2xl lg:border lg:bg-navy-main/60 lg:p-6
		{isBefore ? 'lg:border-brand-red/40' : 'lg:border-brand-green/40'}"
>
	<!-- Desktop header (hidden on mobile) -->
	<div class="mb-2 hidden items-center gap-3 lg:flex">
		<div
			class="flex h-10 w-10 items-center justify-center rounded-full
				{isBefore ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-green/20 text-brand-green'}"
		>
			<i class="fa-solid {isBefore ? 'fa-triangle-exclamation' : 'fa-shield-halved'}"></i>
		</div>
		<div>
			<span
				class="text-xs font-bold tracking-wider uppercase
					{isBefore ? 'text-brand-red' : 'text-brand-green'}"
			>
				{isBefore ? tx('step5.metadata.before') : tx('step5.metadata.after')}
			</span>
			<p class="text-sm font-semibold text-white">
				{isBefore ? tx('step5.metadata.beforeDesc') : tx('step5.metadata.afterDesc')}
			</p>
		</div>
	</div>

	<!-- Mobile description (hidden on desktop) -->
	<p class="mb-1 text-xs font-semibold text-white lg:hidden">
		{isBefore ? tx('step5.metadata.beforeDesc') : tx('step5.metadata.afterDesc')}
	</p>

	<!-- Mobile banner (hidden on desktop) -->
	<div
		class="mb-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 lg:hidden
			{isBefore ? 'border-brand-red/20 bg-brand-red/10' : 'border-brand-green/20 bg-brand-green/10'}"
	>
		<i
			class="fa-solid flex-shrink-0 text-sm
				{isBefore ? 'fa-circle-exclamation text-brand-red' : 'fa-shield-halved text-brand-green'}"
		></i>
		<p class="text-xs font-medium {isBefore ? 'text-brand-red/90' : 'text-brand-green/90'}">
			{isBefore
				? tx('step5.metadata.highRiskWarning', { count: totalFieldsRemoved })
				: tx('step5.metadata.allRemovedSuccess')}
		</p>
	</div>

	<!-- Metadata rows -->
	<div class="flex flex-col gap-2">
		<!-- GPS -->
		<div
			class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5 lg:bg-navy-card lg:px-4"
		>
			<span class="flex items-center gap-2 text-xs text-text-muted">
				<i class="fa-solid fa-location-dot {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.gps')}
			</span>
			{#if isBefore}
				<span class="font-mono text-xs text-white"
					>{tx('step5.metadata.filesCount', { count: breakdown.gpsLocations })}</span
				>
			{:else}
				<span class="flex items-center gap-1 font-mono text-xs text-brand-green">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- EXIF -->
		<div
			class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5 lg:bg-navy-card lg:px-4"
		>
			<span class="flex items-center gap-2 text-xs text-text-muted">
				<i class="fa-solid fa-camera {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.exif')}
			</span>
			{#if isBefore}
				<span class="font-mono text-xs text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.exifFields })}</span
				>
			{:else}
				<span class="flex items-center gap-1 font-mono text-xs text-brand-green">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- XMP -->
		<div
			class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5 lg:bg-navy-card lg:px-4"
		>
			<span class="flex items-center gap-2 text-xs text-text-muted">
				<i class="fa-solid fa-tag {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.xmp')}
			</span>
			{#if isBefore}
				<span class="font-mono text-xs text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.xmpFields })}</span
				>
			{:else}
				<span class="flex items-center gap-1 font-mono text-xs text-brand-green">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- ID3/MP4 (mobile only) -->
		<div
			class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5 lg:hidden"
		>
			<span class="flex items-center gap-2 text-xs text-text-muted">
				<i class="fa-solid fa-film {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.id3mp4')}
			</span>
			{#if isBefore}
				<span class="font-mono text-xs text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.id3mp4Fields })}</span
				>
			{:else}
				<span class="flex items-center gap-1 font-mono text-xs text-brand-green">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- Other -->
		<div
			class="flex items-center justify-between rounded-lg border border-gray-800 bg-navy-main px-3 py-2.5 lg:bg-navy-card lg:px-4"
		>
			<span class="flex items-center gap-2 text-xs text-text-muted">
				<i class="fa-solid fa-ellipsis {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.other')}
			</span>
			{#if isBefore}
				<span class="font-mono text-xs text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.otherFields })}</span
				>
			{:else}
				<span class="flex items-center gap-1 font-mono text-xs text-brand-green">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>
	</div>

	<!-- Desktop footer (hidden on mobile) -->
	<p
		class="mt-1 hidden items-center gap-2 text-xs lg:flex
			{isBefore ? 'text-brand-red/80' : 'text-brand-green/80'}"
	>
		<i class="fa-solid {isBefore ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
		{isBefore
			? tx('step5.metadata.totalExposed', { count: totalFieldsRemoved })
			: tx('step5.metadata.allClean')}
	</p>

	<!-- Mobile risk bar (hidden on desktop) -->
	<div class="mt-1 lg:hidden">
		<div class="mb-1 flex justify-between text-[10px] text-text-muted">
			<span>{tx('step5.metadata.totalRisk')}</span>
			<span class="font-bold {isBefore ? 'text-brand-red' : 'text-brand-green'}">
				{isBefore ? tx('step5.metadata.riskHigh') : tx('step5.metadata.riskNone')}
			</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-navy-main">
			{#if isBefore}
				<div
					class="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-orange"
					style="width: 92%"
				></div>
			{:else}
				<div class="h-full rounded-full bg-brand-green" style="width: 0%"></div>
			{/if}
		</div>
	</div>
</div>

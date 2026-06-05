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
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="flex flex-col gap-2 lg:gap-4 lg:bg-navy-main/60 lg:rounded-2xl lg:border lg:p-6
		{isBefore ? 'lg:border-brand-red/40' : 'lg:border-brand-green/40'}"
>
	<!-- Desktop header (hidden on mobile) -->
	<div class="hidden lg:flex items-center gap-3 mb-2">
		<div
			class="w-10 h-10 rounded-full flex items-center justify-center
				{isBefore ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-green/20 text-brand-green'}"
		>
			<i class="fa-solid {isBefore ? 'fa-triangle-exclamation' : 'fa-shield-halved'}"></i>
		</div>
		<div>
			<span
				class="text-xs font-bold uppercase tracking-wider
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
	<p class="lg:hidden text-xs text-white font-semibold mb-1">
		{isBefore ? tx('step5.metadata.beforeDesc') : tx('step5.metadata.afterDesc')}
	</p>

	<!-- Mobile banner (hidden on desktop) -->
	<div
		class="lg:hidden flex items-center gap-2 border rounded-xl px-3 py-2.5 mb-1
			{isBefore
			? 'bg-brand-red/10 border-brand-red/20'
			: 'bg-brand-green/10 border-brand-green/20'}"
	>
		<i
			class="fa-solid text-sm flex-shrink-0
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
			class="flex items-center justify-between px-3 lg:px-4 py-2.5 rounded-lg bg-navy-main lg:bg-navy-card border border-gray-800"
		>
			<span class="text-xs text-text-muted flex items-center gap-2">
				<i class="fa-solid fa-location-dot {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.gps')}
			</span>
			{#if isBefore}
				<span class="text-xs font-mono text-white"
					>{tx('step5.metadata.filesCount', { count: breakdown.gpsLocations })}</span
				>
			{:else}
				<span class="text-xs font-mono text-brand-green flex items-center gap-1">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- EXIF -->
		<div
			class="flex items-center justify-between px-3 lg:px-4 py-2.5 rounded-lg bg-navy-main lg:bg-navy-card border border-gray-800"
		>
			<span class="text-xs text-text-muted flex items-center gap-2">
				<i class="fa-solid fa-camera {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.exif')}
			</span>
			{#if isBefore}
				<span class="text-xs font-mono text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.exifFields })}</span
				>
			{:else}
				<span class="text-xs font-mono text-brand-green flex items-center gap-1">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- XMP -->
		<div
			class="flex items-center justify-between px-3 lg:px-4 py-2.5 rounded-lg bg-navy-main lg:bg-navy-card border border-gray-800"
		>
			<span class="text-xs text-text-muted flex items-center gap-2">
				<i class="fa-solid fa-tag {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.xmp')}
			</span>
			{#if isBefore}
				<span class="text-xs font-mono text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.xmpFields })}</span
				>
			{:else}
				<span class="text-xs font-mono text-brand-green flex items-center gap-1">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- ID3/MP4 (mobile only) -->
		<div
			class="lg:hidden flex items-center justify-between px-3 py-2.5 rounded-lg bg-navy-main border border-gray-800"
		>
			<span class="text-xs text-text-muted flex items-center gap-2">
				<i class="fa-solid fa-film {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.id3mp4')}
			</span>
			{#if isBefore}
				<span class="text-xs font-mono text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.id3mp4Fields })}</span
				>
			{:else}
				<span class="text-xs font-mono text-brand-green flex items-center gap-1">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>

		<!-- Other -->
		<div
			class="flex items-center justify-between px-3 lg:px-4 py-2.5 rounded-lg bg-navy-main lg:bg-navy-card border border-gray-800"
		>
			<span class="text-xs text-text-muted flex items-center gap-2">
				<i class="fa-solid fa-ellipsis {isBefore ? 'text-brand-red' : 'text-brand-green'}"></i>
				{tx('step5.metadata.other')}
			</span>
			{#if isBefore}
				<span class="text-xs font-mono text-white"
					>{tx('step5.metadata.fieldsCount', { count: breakdown.otherFields })}</span
				>
			{:else}
				<span class="text-xs font-mono text-brand-green flex items-center gap-1">
					<i class="fa-solid fa-check"></i>
					{tx('step5.metadata.removed')}
				</span>
			{/if}
		</div>
	</div>

	<!-- Desktop footer (hidden on mobile) -->
	<p
		class="hidden lg:flex items-center gap-2 mt-1 text-xs
			{isBefore ? 'text-brand-red/80' : 'text-brand-green/80'}"
	>
		<i class="fa-solid {isBefore ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
		{isBefore
			? tx('step5.metadata.totalExposed', { count: totalFieldsRemoved })
			: tx('step5.metadata.allClean')}
	</p>

	<!-- Mobile risk bar (hidden on desktop) -->
	<div class="lg:hidden mt-1">
		<div class="flex justify-between text-[10px] text-text-muted mb-1">
			<span>{tx('step5.metadata.totalRisk')}</span>
			<span class="font-bold {isBefore ? 'text-brand-red' : 'text-brand-green'}">
				{isBefore ? tx('step5.metadata.riskHigh') : tx('step5.metadata.riskNone')}
			</span>
		</div>
		<div class="w-full h-2 rounded-full bg-navy-main overflow-hidden">
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

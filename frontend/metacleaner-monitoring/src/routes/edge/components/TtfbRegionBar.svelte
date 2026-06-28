<script lang="ts">
	import { t } from '$lib/i18n';
	import type { TtfbRegion } from '$lib/repositories/edgeRepository';

	interface Props {
		region: TtfbRegion;
		variant?: 'desktop' | 'mobile';
	}

	let { region, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="flex items-center gap-3">
		<div class="w-28 text-xs text-textSec truncate flex items-center gap-2">
			<i class="fa-solid fa-location-dot {region.dotColor} text-xs"></i>{region.name}
		</div>
		<div class="flex-1 h-2 bg-surface rounded-full overflow-hidden">
			<div
				class="h-full rounded-full"
				style="width:{region.barWidth}; background-color:{region.barColor}; opacity:{region.barOpacity ??
					1}"
			></div>
		</div>
		<span class="text-xs text-textMain font-medium w-14 text-right">{region.ttfbMs} ms</span>
		<span class="w-14 text-right"
			><span class="px-1.5 py-0.5 {region.statusClass} text-xs rounded">{t(region.statusKey)}</span
			></span
		>
	</div>
{:else}
	<div class="flex items-center gap-2">
		<div class="w-20 text-xs text-textSec flex items-center gap-1.5 flex-shrink-0">
			<i class="fa-solid fa-location-dot {region.dotColor} text-xs"></i>{region.shortName}
		</div>
		<div class="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
			<div
				class="h-full rounded-full"
				style="width:{region.barWidth}; background-color:{region.barColor}; opacity:{region.barOpacity ??
					1}"
			></div>
		</div>
		<span class="text-xs text-textMain font-medium w-12 text-right flex-shrink-0"
			>{region.ttfbMs} ms</span
		>
		<span class="w-14 text-right flex-shrink-0"
			><span class="px-1.5 py-0.5 {region.statusClass} text-xs rounded">{t(region.statusKey)}</span
			></span
		>
	</div>
{/if}

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { MetadataBreakdown } from '$lib/types/processing';
	import MetadataCategoryCard from './MetadataCategoryCard.svelte';

	interface Props {
		breakdown: MetadataBreakdown;
		gpsCount: number;
		mode: 'before' | 'after';
		compact?: boolean;
	}

	const { breakdown, gpsCount, mode, compact = false }: Props = $props();

	const removedLabel = $derived(tx('step5.metadata.removed'));
</script>

{#if breakdown}
	<div class="flex flex-col gap-2">
		<MetadataCategoryCard
			icon="fa-location-dot"
			label={tx('step5.metadata.gps')}
			variant={mode}
			valueText={mode === 'before'
				? tx('step5.metadata.filesCount', { count: gpsCount })
				: removedLabel}
			{compact}
		/>
		<MetadataCategoryCard
			icon="fa-camera"
			label={tx('step5.metadata.exif')}
			variant={mode}
			valueText={mode === 'before'
				? tx('step5.metadata.fieldsCount', { count: breakdown.exifFields })
				: removedLabel}
			{compact}
		/>
		<MetadataCategoryCard
			icon="fa-tag"
			label={tx('step5.metadata.xmp')}
			variant={mode}
			valueText={mode === 'before'
				? tx('step5.metadata.fieldsCount', { count: breakdown.xmpFields })
				: removedLabel}
			{compact}
		/>
		{#if breakdown.id3mp4Fields > 0}
			<MetadataCategoryCard
				icon="fa-film"
				label={tx('step5.metadata.id3mp4')}
				variant={mode}
				valueText={mode === 'before'
					? tx('step5.metadata.fieldsCount', { count: breakdown.id3mp4Fields })
					: removedLabel}
				{compact}
			/>
		{/if}
		{#if breakdown.otherFields > 0}
			<MetadataCategoryCard
				icon="fa-ellipsis"
				label={tx('step5.metadata.other')}
				variant={mode}
				valueText={mode === 'before'
					? tx('step5.metadata.fieldsCount', { count: breakdown.otherFields })
					: removedLabel}
				{compact}
			/>
		{/if}
	</div>
{/if}

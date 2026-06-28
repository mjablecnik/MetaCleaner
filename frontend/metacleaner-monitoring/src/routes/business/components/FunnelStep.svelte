<script lang="ts">
	import { t } from '$lib/i18n';

	interface Props {
		labelKey: string;
		value: number;
		conversionPercent?: string;
		color: string;
	}

	let { labelKey, value, conversionPercent, color }: Props = $props();
</script>

<div>
	<div class="flex justify-between text-xs mb-1">
		<span class="text-textSec">{t(labelKey)}</span>
		<span class="text-textMain font-medium">
			{value.toLocaleString()}
			{#if conversionPercent}
				<span class="text-textSec">{conversionPercent}</span>
			{:else}
				<span class="text-textSec">100%</span>
			{/if}
		</span>
	</div>
	<div class="w-full h-1.5 bg-surface rounded-full">
		<div
			class="h-full rounded-full"
			style="background:{color};width:{conversionPercent ?? '100%'}"
		></div>
	</div>
</div>

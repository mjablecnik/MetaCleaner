<script lang="ts">
	interface Props {
		value: number;
		max: number;
		barClass?: string;
		labelClass?: string;
	}

	let { value, max, barClass, labelClass }: Props = $props();
</script>

<div class="w-full">
	<div class="flex justify-between text-xs mb-1">
		<span class="text-textSec">Pool</span>
		<span class="{labelClass ?? 'text-textMain'}">{value}/{max}</span>
	</div>
	<div class="w-full h-1.5 bg-surface rounded-full overflow-hidden">
		<div
			class="h-full {barClass ?? 'bg-primary'} rounded-full transition-all"
			style="width:{Math.round((value / max) * 100)}%"
		></div>
	</div>
</div>

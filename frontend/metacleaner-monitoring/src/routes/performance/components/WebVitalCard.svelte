<script lang="ts">
	import type { CoreWebVital } from '$lib/repositories/performanceRepository';

	interface Props {
		vital: CoreWebVital;
	}

	let { vital }: Props = $props();
</script>

<div>
	<div class="flex justify-between items-center mb-1.5">
		<div>
			<span class="text-sm text-textMain font-medium">{vital.label}</span>
			<span class="text-xs text-textSec ml-1">{vital.description}</span>
		</div>
		<span class="{vital.statusClass} font-bold text-sm">{vital.value}{vital.unit}</span>
	</div>
	<div class="w-full h-2 bg-surface rounded-full overflow-hidden">
		<div class="h-full {vital.barClass} rounded-full" style="width:{vital.barWidth}"></div>
	</div>
	<div class="flex justify-between text-xs text-textSec mt-1">
		<span>{vital.threshold}</span>
		<span class="{vital.statusClass} font-medium">{vital.statusSymbol}</span>
	</div>
</div>

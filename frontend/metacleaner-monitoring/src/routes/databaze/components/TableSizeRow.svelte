<script lang="ts">
	import type { TableSize } from '$lib/repositories/databaseRepository';

	interface Props {
		tableSize: TableSize;
		variant?: 'desktop' | 'mobile';
	}

	let { tableSize, variant = 'desktop' }: Props = $props();
</script>

<div class="flex items-center gap-3">
	<div
		class="{variant === 'desktop' ? 'w-24' : 'w-16'} text-xs text-textSec font-mono truncate"
	>
		{tableSize.name}
	</div>
	<div class="flex-1 h-2 bg-surface rounded-full overflow-hidden">
		<div class="h-full {tableSize.barClass} rounded-full" style="width:{tableSize.barWidth}"></div>
	</div>
	<span class="text-xs text-textMain font-medium w-12 text-right">{tableSize.sizeLabel}</span>
</div>

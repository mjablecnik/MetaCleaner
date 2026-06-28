<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		headers: string[];
		children: Snippet;
	}

	let { headers, children }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-surface">
				{#each headers as header, i}
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 {i < headers.length - 1 ? 'pr-4' : ''}">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-surface/60">
			{@render children()}
		</tbody>
	</table>
</div>

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { ErrorEntry } from '$lib/repositories/docsRepository';

	interface Props {
		entries: ErrorEntry[];
	}

	const { entries }: Props = $props();

	function statusColor(status: number): string {
		if (status >= 500) return 'text-brand-red bg-brand-red/10 border-brand-red/20';
		if (status >= 400) return 'text-brand-orange bg-brand-orange/10 border-brand-orange/20';
		return 'text-brand-green bg-brand-green/10 border-brand-green/20';
	}
</script>

<div class="overflow-x-auto rounded-lg border border-gray-800">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-gray-800 bg-navy-card">
				<th
					class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-text-muted uppercase"
					>{tx('docs.errors.table.status')}</th
				>
				<th
					class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-text-muted uppercase"
					>{tx('docs.errors.table.code')}</th
				>
				<th
					class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-text-muted uppercase"
					>{tx('docs.errors.table.description')}</th
				>
				<th
					class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-text-muted uppercase"
					>{tx('docs.errors.table.solution')}</th
				>
			</tr>
		</thead>
		<tbody>
			{#each entries as entry, i (entry.code)}
				<tr
					class="{i % 2 === 0
						? 'bg-transparent'
						: 'bg-navy-card/40'} border-b border-gray-800/50 last:border-0"
				>
					<td class="px-4 py-3">
						<span
							class="rounded border px-1.5 py-0.5 font-mono text-xs font-semibold {statusColor(
								entry.status
							)}"
						>
							{entry.status}
						</span>
					</td>
					<td class="px-4 py-3">
						<code class="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-brand-orange"
							>{entry.code}</code
						>
					</td>
					<td class="px-4 py-3 text-xs text-text-muted">{tx(entry.descriptionKey)}</td>
					<td class="px-4 py-3 text-xs text-text-muted">{tx(entry.solutionKey)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

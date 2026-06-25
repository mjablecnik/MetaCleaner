<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { EndpointParam } from '$lib/repositories/docsRepository';

	interface Props {
		params: EndpointParam[];
		showDefault?: boolean;
	}

	let { params, showDefault = false }: Props = $props();
</script>

<div class="overflow-x-auto rounded-lg border border-gray-800">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-gray-800 bg-navy-card">
				<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
					>{tx('docs.common.field')}</th
				>
				<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
					>{tx('docs.common.type')}</th
				>
				<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted">
					{#if showDefault}
						{tx('docs.common.defaultValue')}
					{:else}
						Req.
					{/if}
				</th>
				<th class="px-3 py-2 text-left text-xs font-semibold text-text-muted"
					>{tx('docs.errors.table.description')}</th
				>
			</tr>
		</thead>
		<tbody>
			{#each params as param (param.name)}
				<tr class="border-b border-gray-800/50 last:border-0">
					<td class="px-3 py-2"><code class="text-xs text-brand-blue">{param.name}</code></td>
					<td class="px-3 py-2"><code class="text-xs text-brand-orange">{param.type}</code></td>
					<td class="px-3 py-2">
						{#if showDefault}
							<code class="text-xs text-text-muted">{param.default ?? '—'}</code>
						{:else if param.required}
							<span class="text-xs font-medium text-brand-green"
								>{tx('docs.common.required')}</span
							>
						{:else}
							<span class="text-xs text-text-muted">{tx('docs.common.optional')}</span>
						{/if}
					</td>
					<td class="px-3 py-2 text-xs text-text-muted">{tx(param.descriptionKey)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

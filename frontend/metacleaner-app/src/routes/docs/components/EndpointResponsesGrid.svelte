<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import CodeBlock from '$lib/shared/elements/CodeBlock.svelte';
	import type { EndpointResponse } from '$lib/repositories/docsRepository';

	interface Props {
		responses: EndpointResponse[];
	}

	let { responses }: Props = $props();

	function responseBadgeColor(variant: 'success' | 'error'): string {
		return variant === 'success'
			? 'bg-brand-green/10 text-brand-green border-brand-green/30'
			: 'bg-brand-red/10 text-brand-red border-brand-red/30';
	}
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
	{#each responses as resp (resp.status)}
		<div>
			<div class="mb-1.5 flex items-center gap-2">
				<span
					class="rounded border px-1.5 py-0.5 font-mono text-xs font-semibold {responseBadgeColor(
						resp.variant
					)}"
				>
					{resp.status}
				</span>
				<span class="text-xs text-text-muted">{tx(resp.labelKey)}</span>
			</div>
			<CodeBlock code={resp.body} />
		</div>
	{/each}
</div>

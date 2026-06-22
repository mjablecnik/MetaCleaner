<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { QuickStartStep } from '$lib/repositories/docsRepository';

	interface Props {
		steps: QuickStartStep[];
	}

	const { steps }: Props = $props();
</script>

<div class="flex flex-col">
	{#each steps as step (step.number)}
		<div class="flex gap-4">
			<!-- Step number + connector line -->
			<div class="flex flex-col items-center">
				<div
					class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-brand-blue/30 bg-brand-blue/10 text-xs font-bold text-brand-blue"
				>
					{step.number}
				</div>
				{#if !step.isLast}
					<div class="mt-1 w-px flex-1 bg-gray-700"></div>
				{/if}
			</div>

			<!-- Step content -->
			<div class="min-w-0 pb-5">
				<p class="mb-1 text-sm font-semibold text-white">{tx(step.titleKey)}</p>
				<p class="mb-2 text-xs text-text-muted">{tx(step.descriptionKey)}</p>
				<div
					class="flex flex-wrap items-center gap-0.5 rounded-md border border-gray-800 bg-[#080f1e] px-3 py-1.5 font-mono text-xs"
				>
					{#each step.codeSnippets as snippet, i (i)}
						<span class={snippet.color}>{snippet.text}</span>
					{/each}
				</div>
			</div>
		</div>
	{/each}
</div>

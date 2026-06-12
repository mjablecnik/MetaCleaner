<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		score: number;
	}

	let { score }: Props = $props();

	const barColors = [
		'var(--color-brand-red)',
		'var(--color-brand-orange)',
		'var(--color-brand-yellow)',
		'var(--color-brand-green)'
	];

	const labelKeys: Record<number, string> = {
		1: 'auth.common.strength.weak',
		2: 'auth.common.strength.average',
		3: 'auth.common.strength.good',
		4: 'auth.common.strength.strong'
	};

	const activeColor = $derived(score > 0 ? barColors[score - 1] : 'var(--color-gray-700)');
	const label = $derived(score > 0 ? tx(labelKeys[score]) : '');
</script>

{#if score > 0}
	<div class="mt-1 flex flex-col gap-1 lg:gap-1.5">
		<div class="flex gap-1 lg:gap-1.5">
			{#each [1, 2, 3, 4] as bar (bar)}
				<div
					class="h-1 flex-1 rounded-sm transition-all duration-300"
					style="background: {bar <= score ? activeColor : 'var(--color-gray-700)'};"
				></div>
			{/each}
		</div>
		{#if label}
			<p class="text-[11px] lg:text-xs" style="color: {activeColor};">
				{label}
			</p>
		{/if}
	</div>
{/if}

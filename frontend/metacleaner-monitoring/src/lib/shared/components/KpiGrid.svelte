<script lang="ts">
	import StatCard from '$lib/shared/elements/StatCard.svelte';

	interface StatCardData {
		labelKey: string;
		value: string;
		valueClass?: string;
		icon?: string;
		iconClass?: string;
		trend?: string;
		trendPositive?: boolean;
		barWidth?: string;
		barClass?: string;
		subtext?: string;
		subtextKey?: string;
	}

	interface Props {
		stats: StatCardData[];
		columns?: 2 | 3 | 4;
	}

	let { stats, columns = 4 }: Props = $props();

	const colClass = $derived(
		columns === 2
			? 'sm:grid-cols-2'
			: columns === 3
				? 'sm:grid-cols-2 lg:grid-cols-3'
				: 'sm:grid-cols-2 lg:grid-cols-4'
	);
</script>

<section class="grid grid-cols-1 {colClass} gap-4">
	{#each stats as stat (stat.labelKey)}
		<StatCard {...stat} />
	{/each}
</section>

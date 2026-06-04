<script lang="ts">
	import StatCard from '$lib/shared/components/StatCard.svelte';

	type Color = 'blue' | 'green' | 'red' | 'orange';

	export interface Stat {
		icon: string;
		iconColor?: Color;
		value: string | number;
		label: string;
		labelMobile?: string;
		highlight?: boolean;
	}

	interface Props {
		stats: Stat[];
		class?: string;
	}

	const { stats, class: extraClass = '' }: Props = $props();
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 {extraClass}">
	{#each stats as stat}
		<StatCard
			icon={stat.icon}
			iconColor={stat.iconColor}
			value={stat.value}
			label={stat.label}
			labelMobile={stat.labelMobile}
			highlight={stat.highlight}
		/>
	{/each}
</div>

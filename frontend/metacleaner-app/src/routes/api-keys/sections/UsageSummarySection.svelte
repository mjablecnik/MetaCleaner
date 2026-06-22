<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import StatCard from '$lib/shared/components/StatCard.svelte';

	interface Props {
		activeKeysCount: number;
		rateLimit: number;
	}

	const { activeKeysCount, rateLimit }: Props = $props();
</script>

<div class="grid grid-cols-2 gap-4">
	<StatCard
		icon="fa-solid fa-key"
		iconColor="blue"
		value={activeKeysCount}
		label={tx('apiKeys.stats.activeKeys')}
	/>
	<StatCard
		icon="fa-solid fa-gauge-high"
		iconColor="orange"
		value={rateLimit}
		label={tx('apiKeys.stats.rateLimit')}
	/>
</div>

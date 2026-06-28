<script lang="ts">
	import { t } from '$lib/i18n';
	import ServiceUptimeCard from '../components/ServiceUptimeCard.svelte';
	import { getServiceCards } from '$lib/repositories/availabilityRepository';

	const serviceCards = getServiceCards();
</script>

<!-- Desktop: 4-column grid -->
<section class="hidden lg:grid grid-cols-4 gap-4">
	{#each serviceCards as card (card.key)}
		<ServiceUptimeCard {card} variant="desktop" />
	{/each}
</section>

<!-- Mobile: 2x2 grid -->
<section class="lg:hidden">
	<h2 class="text-xs font-semibold text-textSec uppercase tracking-wider mb-3">
		{t('availability_overview_title')}
	</h2>
	<div class="grid grid-cols-2 gap-3">
		{#each serviceCards as card (card.key)}
			<ServiceUptimeCard {card} variant="mobile" />
		{/each}
	</div>
</section>

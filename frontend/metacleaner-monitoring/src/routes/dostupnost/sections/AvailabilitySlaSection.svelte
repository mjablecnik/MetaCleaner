<script lang="ts">
	import { t } from '$lib/i18n';
	import SlaGoalBar from '../components/SlaGoalBar.svelte';
	import AvailabilityIncidentsSection from './AvailabilityIncidentsSection.svelte';
	import AvailabilityQuickStatsSection from './AvailabilityQuickStatsSection.svelte';
	import { getSlaGoals } from '$lib/repositories/availabilityRepository';

	const slaGoals = getSlaGoals();

	let slaOpen = $state(true);
</script>

<!-- Desktop: 3-col grid with incidents (col-span-2) + SLA + QuickStats sidebar -->
<section class="hidden lg:grid grid-cols-3 gap-6">
	<AvailabilityIncidentsSection />

	<div class="space-y-4">
		<div class="bg-card border border-surface rounded-xl p-5">
			<h3 class="text-base font-semibold text-textMain mb-4">{t('availability_sla_title')}</h3>
			<div class="space-y-4">
				{#each slaGoals as goal (goal.service)}
					<SlaGoalBar {goal} />
				{/each}
			</div>
		</div>
		<AvailabilityQuickStatsSection />
	</div>
</section>

<!-- Mobile: incidents first, then SLA accordion -->
<div class="lg:hidden space-y-3">
	<AvailabilityIncidentsSection />

	<section class="bg-card border border-surface rounded-xl overflow-hidden">
		<button
			class="w-full flex items-center justify-between p-4"
			style="min-height:52px"
			onclick={() => (slaOpen = !slaOpen)}
		>
			<h3 class="text-sm font-semibold text-textMain">{t('availability_sla_title')}</h3>
			<i
				class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {slaOpen
					? 'rotate-180'
					: ''}"
			></i>
		</button>
		{#if slaOpen}
			<div class="px-4 pb-4 space-y-4">
				{#each slaGoals as goal (goal.service)}
					<SlaGoalBar {goal} />
				{/each}
			</div>
		{/if}
	</section>
</div>

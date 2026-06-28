<script lang="ts">
	import { t } from '$lib/i18n';
	import type { SlaGoal } from '$lib/repositories/availabilityRepository';

	interface Props {
		goal: SlaGoal;
	}

	let { goal }: Props = $props();
</script>

<div>
	<div class="flex justify-between items-center mb-1.5">
		<span class="text-sm text-textSec">{goal.service}</span>
		<span class="text-sm font-semibold {goal.met ? 'text-success' : 'text-secondary'}"
			>{goal.actual}%</span
		>
	</div>
	<div class="h-2 w-full bg-surface rounded-full overflow-hidden">
		<div class="h-full {goal.barClass} rounded-full" style="width:{goal.actual}%"></div>
	</div>
	{#if goal.met}
		<p class="text-xs text-textSec mt-1">
			{t('availability_sla_goalMet', { target: String(goal.target) })}
		</p>
	{:else}
		<p class="text-xs text-secondary mt-1">
			{t('availability_sla_goalNotMet', { target: String(goal.target) })}
		</p>
	{/if}
</div>

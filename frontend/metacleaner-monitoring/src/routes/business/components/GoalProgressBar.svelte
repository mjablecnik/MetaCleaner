<script lang="ts">
	import { t } from '$lib/i18n';
	import type { OkrGoal } from '$lib/repositories/businessRepository';

	interface Props {
		goal: OkrGoal;
	}

	let { goal }: Props = $props();

	const targetLabel = $derived(
		goal.unit === '$'
			? `${goal.unit}${goal.target.toLocaleString()}`
			: `${goal.target.toLocaleString()}${goal.unit}`
	);

	const progressLabel = $derived(
		goal.unit === '$'
			? `${goal.unit}${goal.current.toLocaleString()} / ${goal.unit}${goal.target.toLocaleString()}`
			: `${goal.current.toLocaleString()}${goal.unit} / ${goal.target.toLocaleString()}${goal.unit}`
	);
</script>

<div class="bg-surface/50 rounded-xl p-4">
	<div class="flex justify-between items-start mb-2">
		<h4 class="text-textSec text-xs font-medium">{t(goal.titleKey)}</h4>
		<span class="{goal.statusClass} text-xs font-bold">{goal.progressPercent}%</span>
	</div>
	<div class="text-2xl font-bold text-textMain mb-2">{targetLabel}</div>
	<div class="w-full h-2 bg-surface-deep rounded-full overflow-hidden">
		<div
			class="h-full {goal.progressClass} rounded-full transition-all"
			style="width:{goal.progressPercent}%"
		></div>
	</div>
	<p class="text-xs text-textSec mt-2">{progressLabel}</p>
</div>

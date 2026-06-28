<script lang="ts">
	import { t } from '$lib/i18n';
	import CohortCell from '../components/CohortCell.svelte';

	let accOpen = $state(false);

	// Hardcoded cohort data: rows are months, columns are M0-M5
	const cohortData: { monthKey: string; values: (number | null)[] }[] = [
		{ monthKey: 'business_cohort_month_feb24', values: [100, 84, 71, 63, 57, 52] },
		{ monthKey: 'business_cohort_month_mar24', values: [100, 81, 68, 59, 54, null] },
		{ monthKey: 'business_cohort_month_apr24', values: [100, 79, 65, 58, null, null] },
		{ monthKey: 'business_cohort_month_may24', values: [100, 82, 70, null, null, null] },
		{ monthKey: 'business_cohort_month_jun24', values: [100, 86, null, null, null, null] }
	];
</script>

<!-- ===== DESKTOP COHORT ===== -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('business_cohort_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('business_cohort_subtitle')}</p>
		</div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full text-xs">
			<thead>
				<tr class="border-b border-surface">
					<th class="text-left text-textSec font-medium pb-2 pr-3">{t('business_cohort_cohort')}</th
					>
					<th class="text-center text-textSec font-medium pb-2 px-2">M0</th>
					<th class="text-center text-textSec font-medium pb-2 px-2">M1</th>
					<th class="text-center text-textSec font-medium pb-2 px-2">M2</th>
					<th class="text-center text-textSec font-medium pb-2 px-2">M3</th>
					<th class="text-center text-textSec font-medium pb-2 px-2">M4</th>
					<th class="text-center text-textSec font-medium pb-2 px-2">M5</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface/40">
				{#each cohortData as row (row.monthKey)}
					<tr>
						<td class="py-2 pr-3 text-textSec whitespace-nowrap">{t(row.monthKey)}</td>
						{#each row.values as val, vi (vi)}
							<td class="py-2 px-2 text-center"><CohortCell percent={val} /></td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- ===== MOBILE COHORT ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<button
		onclick={() => (accOpen = !accOpen)}
		class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]"
	>
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
				<i class="fa-solid fa-table text-success text-xs"></i>
			</div>
			<div class="text-left">
				<p class="text-sm font-semibold text-textMain">{t('business_cohort_title')}</p>
				<p class="text-xs text-textSec">{t('business_cohort_subtitleMobile')}</p>
			</div>
		</div>
		<i
			class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accOpen
				? 'rotate-180'
				: ''}"
		></i>
	</button>
	{#if accOpen}
		<div class="border-t border-surface p-4 overflow-x-auto">
			<div class="min-w-[340px]">
				<table class="w-full text-xs">
					<thead>
						<tr class="border-b border-surface">
							<th class="text-left text-textSec font-medium pb-2 pr-2"
								>{t('business_cohort_cohort')}</th
							>
							<th class="text-center text-textSec font-medium pb-2 px-1.5">M0</th>
							<th class="text-center text-textSec font-medium pb-2 px-1.5">M1</th>
							<th class="text-center text-textSec font-medium pb-2 px-1.5">M2</th>
							<th class="text-center text-textSec font-medium pb-2 px-1.5">M3</th>
							<th class="text-center text-textSec font-medium pb-2 px-1.5">M4</th>
							<th class="text-center text-textSec font-medium pb-2 px-1.5">M5</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-surface/40">
						{#each cohortData as row (row.monthKey)}
							<tr>
								<td class="py-2 pr-2 text-textSec whitespace-nowrap">{t(row.monthKey)}</td>
								{#each row.values as val, vi (vi)}
									<td class="py-1.5 px-1.5 text-center"><CohortCell percent={val} /></td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</section>

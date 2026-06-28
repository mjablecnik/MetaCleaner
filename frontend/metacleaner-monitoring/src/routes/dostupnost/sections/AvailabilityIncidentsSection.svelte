<script lang="ts">
	import { t } from '$lib/i18n';
	import IncidentItem from '../components/IncidentItem.svelte';
	import { getIncidents } from '$lib/repositories/availabilityRepository';

	const incidents = getIncidents();
</script>

<!-- Desktop: col-span-2 in a 3-col grid (used alongside SLA section) -->
<div class="hidden lg:block col-span-2 bg-card border border-surface rounded-xl p-5">
	<div class="flex items-center justify-between mb-5">
		<h3 class="text-lg font-semibold text-textMain">{t('availability_incidents_title')}</h3>
		<div class="flex gap-2">
			<button
				class="px-3 py-1 text-xs bg-surface text-textMain rounded-lg border border-border font-medium"
				>{t('common_status_all')}</button
			>
			<button class="px-3 py-1 text-xs text-textSec hover:bg-surface rounded-lg transition-colors"
				>{t('common_status_active')}</button
			>
			<button class="px-3 py-1 text-xs text-textSec hover:bg-surface rounded-lg transition-colors"
				>{t('common_status_resolved')}</button
			>
		</div>
	</div>
	<div class="space-y-3">
		{#each incidents as inc (inc.id)}
			<IncidentItem incident={inc} variant="desktop" />
		{/each}
	</div>
</div>

<!-- Mobile -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<div class="p-4 border-b border-surface flex items-center justify-between">
		<h3 class="text-sm font-semibold text-textMain">{t('availability_incidents_title')}</h3>
		<div class="flex gap-1.5">
			<button
				class="px-2.5 py-1.5 text-xs bg-surface text-textMain rounded-lg border border-border font-medium"
				style="min-height:36px">{t('common_status_all')}</button
			>
			<button
				class="px-2.5 py-1.5 text-xs text-textSec hover:bg-surface rounded-lg transition-colors"
				style="min-height:36px">{t('common_status_active')}</button
			>
			<button
				class="px-2.5 py-1.5 text-xs text-textSec hover:bg-surface rounded-lg transition-colors"
				style="min-height:36px">{t('common_status_resolved')}</button
			>
		</div>
	</div>
	<div class="p-4 space-y-3">
		{#each incidents as inc (inc.id)}
			<IncidentItem incident={inc} variant="mobile" />
		{/each}
	</div>
</section>

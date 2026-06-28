<script lang="ts">
	import { t } from '$lib/i18n';
	import type { PerformanceEvent } from '$lib/repositories/performanceRepository';

	type EventFilter = 'all' | 'critical' | 'warning' | 'info';

	let { events }: { events: PerformanceEvent[] } = $props();

	const performanceEvents = $derived(events);
	let activeEventFilter = $state<EventFilter>('all');
</script>

<!-- Desktop: Performance Event Log -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('performance_eventLog_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('performance_eventLog_subtitle')}</p>
		</div>
		<div class="flex gap-3 flex-wrap">
			<div class="flex rounded-lg overflow-hidden border border-border">
				<button class="px-3 py-1.5 bg-amber/20 text-amber text-xs font-medium"
					>{t('performance_filters_all')}</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>{t('performance_filters_critical')}</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>{t('performance_filters_warning')}</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>{t('performance_filters_info')}</button
				>
			</div>
			<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
				<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
				<input
					type="text"
					placeholder={t('performance_eventLog_searchPlaceholder')}
					class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32"
				/>
			</div>
		</div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-surface">
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('common_table_time')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('performance_table_severity')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('common_table_type')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('performance_table_descriptionEndpoint')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('performance_table_service')}</th
					>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3"
						>{t('common_table_status')}</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface/60">
				{#each performanceEvents as evt (evt.id)}
					<tr class="hover:bg-surface/30 transition-colors">
						<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{evt.time}</td>
						<td class="py-3 pr-4"
							><span class="px-2 py-0.5 {evt.levelClass} text-xs rounded font-medium"
								>{t(evt.levelKey)}</span
							></td
						>
						<td class="py-3 pr-4 text-textSec text-xs">{evt.type}</td>
						<td class="py-3 pr-4 text-textMain max-w-xs truncate">{evt.message}</td>
						<td class="py-3 pr-4 text-textSec font-mono text-xs">{evt.endpoint ?? ''}</td>
						<td class="py-3"
							><span class="px-2 py-0.5 {evt.statusClass} text-xs rounded">{t(evt.statusKey)}</span
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- Mobile: Performance Event Log -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<div class="p-4 border-b border-surface">
		<h3 class="text-sm font-semibold text-textMain">{t('performance_eventLog_title')}</h3>
		<p class="text-xs text-textSec mt-0.5">{t('performance_eventLog_subtitleMobile')}</p>
		<div class="flex gap-0 mt-3 rounded-lg overflow-hidden border border-border">
			<button
				onclick={() => (activeEventFilter = 'all')}
				class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'all'
					? 'bg-amber/20 text-amber'
					: 'bg-transparent text-textSec hover:bg-surface'}">{t('performance_filters_all')}</button
			>
			<button
				onclick={() => (activeEventFilter = 'critical')}
				class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter ===
				'critical'
					? 'bg-amber/20 text-amber'
					: 'bg-transparent text-textSec hover:bg-surface'}"
				>{t('performance_filters_critical')}</button
			>
			<button
				onclick={() => (activeEventFilter = 'warning')}
				class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter ===
				'warning'
					? 'bg-amber/20 text-amber'
					: 'bg-transparent text-textSec hover:bg-surface'}"
				>{t('performance_filters_warning')}</button
			>
			<button
				onclick={() => (activeEventFilter = 'info')}
				class="flex-1 px-2 py-2 text-xs font-medium transition-colors {activeEventFilter === 'info'
					? 'bg-amber/20 text-amber'
					: 'bg-transparent text-textSec hover:bg-surface'}">{t('performance_filters_info')}</button
			>
		</div>
	</div>
	<div class="divide-y divide-surface/60">
		{#each performanceEvents.filter((e) => activeEventFilter === 'all' || e.level === activeEventFilter) as evt (evt.id)}
			<div class="p-4">
				<div class="flex items-start justify-between gap-2 mb-2">
					<div class="flex items-center gap-2 flex-wrap">
						<span class="px-2 py-0.5 {evt.levelClass} text-xs rounded font-medium"
							>{t(evt.levelKey)}</span
						>
						<span class="text-textSec text-xs">{evt.type}</span>
					</div>
					<div class="flex items-center gap-2 flex-shrink-0">
						<span class="px-2 py-0.5 {evt.statusClass} text-xs rounded">{t(evt.statusKey)}</span>
						<span class="text-textSec font-mono text-xs">{evt.time.substring(0, 5)}</span>
					</div>
				</div>
				<p class="text-textMain text-xs leading-relaxed mb-1.5">{evt.message}</p>
				{#if evt.endpoint}
					<p class="text-textSec font-mono text-xs">{evt.endpoint}</p>
				{/if}
			</div>
		{/each}
	</div>
</section>

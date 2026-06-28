<script lang="ts">
	import { t } from '$lib/i18n';
	import { getSecurityEvents } from '$lib/repositories/securityRepository';

	type AccordionKey = 'log';

	const securityEvents = getSecurityEvents();

	let accordionOpen = $state<Record<AccordionKey, boolean>>({ log: false });

	function toggleAccordion(key: AccordionKey) {
		accordionOpen[key] = !accordionOpen[key];
	}
</script>

<!-- ===== DESKTOP: Security Event Log Table ===== -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('security_eventLog_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('security_eventLog_subtitle')}</p>
		</div>
		<div class="flex gap-3 flex-wrap">
			<div class="flex rounded-lg overflow-hidden border border-border">
				<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium">{t('common_status_all')}</button>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface">{t('security_severity_critical')}</button>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface">{t('common_status_warning')}</button>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface">{t('common_labels_info')}</button>
			</div>
			<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
				<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
				<input type="text" placeholder="{t('security_eventLog_searchPlaceholder')}" class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32" />
			</div>
		</div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-surface">
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_time')}</th>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_type')}</th>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_description')}</th>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('security_table_ipSource')}</th>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">{t('common_table_endpoint')}</th>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">{t('common_table_status')}</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface/60">
				{#each securityEvents as event (event.id)}
					<tr class="hover:bg-surface/30 transition-colors">
						<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{event.time}</td>
						<td class="py-3 pr-4"><span class="px-2 py-0.5 {event.typeLabelClass} text-xs rounded font-medium">{event.typeLabel}</span></td>
						<td class="py-3 pr-4 text-textMain max-w-xs truncate">{event.description}</td>
						<td class="py-3 pr-4 text-textSec font-mono text-xs">{event.ipSource}</td>
						<td class="py-3 pr-4 text-textSec font-mono text-xs">{event.endpoint}</td>
						<td class="py-3"><span class="px-2 py-0.5 {event.statusClass} text-xs rounded">{t(event.statusKey)}</span></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- ===== MOBILE: Security Event Log Accordion ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<button
		onclick={() => toggleAccordion('log')}
		class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]"
	>
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
				<i class="fa-solid fa-list text-textSec text-xs"></i>
			</div>
			<div class="text-left">
				<p class="text-sm font-semibold text-textMain">{t('security_eventLog_title')}</p>
				<p class="text-xs text-textSec">{t('security_eventLog_subtitleMobile')}</p>
			</div>
		</div>
		<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accordionOpen.log ? 'rotate-180' : ''}"></i>
	</button>
	{#if accordionOpen.log}
		<div class="border-t border-surface">
			<div class="px-4 py-3 flex gap-2 overflow-x-auto border-b border-surface">
				<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px]">{t('common_status_all')}</button>
				<button class="px-3 py-1.5 bg-surface text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">{t('security_severity_critical')}</button>
				<button class="px-3 py-1.5 bg-surface text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">{t('common_status_warning')}</button>
				<button class="px-3 py-1.5 bg-surface text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">{t('common_labels_info')}</button>
			</div>
			<div class="px-4 py-3 border-b border-surface">
				<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5">
					<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
					<input type="text" placeholder="{t('security_eventLog_searchPlaceholderMobile')}" class="bg-transparent text-sm text-textMain placeholder-textSec outline-none flex-1" />
				</div>
			</div>
			<div class="divide-y divide-surface/60">
				{#each securityEvents as event (event.id)}
					<div class="p-4">
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-2">
								<span class="px-2 py-0.5 {event.typeLabelClass} text-xs rounded font-medium">{event.typeLabel}</span>
								<span class="font-mono text-xs text-textSec">{event.time}</span>
							</div>
							<span class="px-2 py-0.5 {event.statusClass} text-xs rounded">{t(event.statusKey)}</span>
						</div>
						<p class="text-sm text-textMain mb-1">{event.description}</p>
						<p class="text-xs text-textSec font-mono">{event.ipSource} · {event.endpoint}</p>
					</div>
				{/each}
			</div>
			<div class="px-4 py-3 border-t border-surface">
				<button class="w-full py-2.5 text-xs text-blue font-medium text-center min-h-[44px]">{t('security_eventLog_loadMore')}</button>
			</div>
		</div>
	{/if}
</section>

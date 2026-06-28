<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import type { WafLogEntry } from '$lib/repositories/edgeRepository';

	let { wafLog }: { wafLog: WafLogEntry[] } = $props();

	function borderColor(typeClass: string): string {
		if (typeClass.includes('error')) return chartColors.error;
		if (typeClass.includes('8b5cf6')) return chartColors.purple;
		if (typeClass.includes('f97316')) return chartColors.secondary;
		return chartColors.blue;
	}
</script>

<!-- Desktop: WAF & Security Log -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('edge_wafLog_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('edge_wafLog_subtitle')}</p>
		</div>
		<div class="flex gap-3 flex-wrap">
			<div class="flex rounded-lg overflow-hidden border border-border">
				<button class="px-3 py-1.5 bg-secondary/20 text-secondary text-xs font-medium"
					>{t('common_status_all')}</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>DDoS</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>WAF</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Bot</button
				>
			</div>
			<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
				<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
				<input
					type="text"
					placeholder={t('edge_wafLog_searchPlaceholder')}
					class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-36"
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
						>{t('common_table_type')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('edge_table_ipAddress')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('edge_table_country')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('edge_table_ruleMessage')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('common_table_action')}</th
					>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3"
						>{t('common_table_status')}</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface/60">
				{#each wafLog as entry (entry.id)}
					<tr class="hover:bg-surface/30 transition-colors">
						<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{entry.time}</td>
						<td class="py-3 pr-4"
							><span class="px-2 py-0.5 {entry.typeClass} text-xs rounded font-medium"
								>{entry.type}</span
							></td
						>
						<td class="py-3 pr-4 text-textMain font-mono text-xs whitespace-nowrap">{entry.ip}</td>
						<td class="py-3 pr-4 text-textSec text-xs">{entry.countryFlag} {entry.country}</td>
						<td class="py-3 pr-4 text-textMain max-w-xs truncate">{entry.message}</td>
						<td class="py-3 pr-4"
							><span class="px-2 py-0.5 {entry.actionClass} text-xs rounded font-medium"
								>{t(entry.actionKey)}</span
							></td
						>
						<td class="py-3"
							><span class="px-2 py-0.5 {entry.statusClass} text-xs rounded"
								>{t(entry.statusKey)}</span
							></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- Mobile: WAF & Security Logs -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="mb-4">
		<div class="flex justify-between items-start mb-3">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('edge_wafLog_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('edge_wafLog_subtitle')}</p>
			</div>
		</div>
		<div class="flex rounded-lg overflow-hidden border border-border mb-3">
			<button class="flex-1 px-2 py-2 bg-secondary/20 text-secondary text-xs font-medium"
				>{t('common_status_all')}</button
			>
			<button
				class="flex-1 px-2 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
				>DDoS</button
			>
			<button
				class="flex-1 px-2 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
				>WAF</button
			>
			<button
				class="flex-1 px-2 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
				>Bot</button
			>
		</div>
		<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5">
			<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
			<input
				type="text"
				placeholder={t('edge_wafLog_searchPlaceholder')}
				class="bg-transparent text-sm text-textMain placeholder-textSec outline-none flex-1"
			/>
		</div>
	</div>

	<div class="space-y-3">
		{#each wafLog as entry (entry.id)}
			<div
				class="border-l-[3px] bg-surface/40 border border-border/40 rounded-lg p-3"
				style="border-left-color:{borderColor(entry.typeClass)}"
			>
				<div class="flex justify-between items-start mb-2">
					<div class="flex items-center gap-2">
						<span class="px-2 py-0.5 {entry.typeClass} text-xs rounded font-medium"
							>{entry.type}</span
						>
						<span class="text-xs text-textSec font-mono">{entry.time}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="px-2 py-0.5 {entry.actionClass} text-xs rounded font-medium"
							>{t(entry.actionKey)}</span
						>
						<span class="px-1.5 py-0.5 {entry.statusClass} text-xs rounded"
							>{t(entry.statusKey)}</span
						>
					</div>
				</div>
				<div class="flex items-center gap-2 mb-1.5">
					<span class="text-textMain font-mono text-xs">{entry.ip}</span>
					<span class="text-textSec text-xs">{entry.countryFlag} {entry.country}</span>
				</div>
				<p class="text-xs text-textSec leading-relaxed">{entry.message}</p>
			</div>
		{/each}
	</div>
</section>

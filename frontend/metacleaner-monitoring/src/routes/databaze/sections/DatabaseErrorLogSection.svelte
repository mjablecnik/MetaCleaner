<script lang="ts">
	import { t } from '$lib/i18n';
	import { getDbErrorLog } from '$lib/repositories/databaseRepository';

	const errorLog = getDbErrorLog();
</script>

<!-- Desktop: error log table -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('database_errorLog_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('common_timeRange_last24h')} · 12 záznamů</p>
		</div>
		<div class="flex gap-3 flex-wrap">
			<div class="flex rounded-lg overflow-hidden border border-border">
				<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium"
					>{t('common_status_all')}</button
				>
				<button
					class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Timeout</button
				>
				<button
					class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Deadlock</button
				>
				<button
					class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Conn</button
				>
			</div>
			<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
				<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
				<input
					type="text"
					placeholder={t('common_actions_search')}
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
						>{t('common_table_type')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('common_table_message')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('database_table_columnTable')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('common_table_duration')}</th
					>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3"
						>{t('common_table_status')}</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface/60">
				{#each errorLog as entry (entry.id)}
					<tr class="hover:bg-surface/30 transition-colors">
						<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">{entry.time}</td>
						<td class="py-3 pr-4">
							<span class="px-2 py-0.5 {entry.typeClass} text-xs rounded font-medium"
								>{entry.type}</span
							>
						</td>
						<td class="py-3 pr-4 text-textMain max-w-xs truncate">{entry.message}</td>
						<td class="py-3 pr-4 text-textSec font-mono text-xs">{entry.table}</td>
						<td class="py-3 pr-4 {entry.durationClass} text-xs font-mono">{entry.duration}</td>
						<td class="py-3">
							<span class="px-2 py-0.5 {entry.statusClass} text-xs rounded"
								>{t(entry.statusKey)}</span
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- Mobile: filter + card list -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<div class="px-4 pt-4 pb-3 border-b border-surface">
		<div class="flex items-center justify-between mb-3">
			<div>
				<h3 class="text-sm font-semibold text-textMain">{t('database_errorLog_title')}</h3>
				<p class="text-[10px] text-textSec mt-0.5">{t('common_timeRange_last24h')} · 12 záznamů</p>
			</div>
		</div>
		<div class="flex gap-2 mb-3 overflow-x-auto pb-1">
			<button
				class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0"
				>{t('common_status_all')}</button
			>
			<button
				class="px-3 py-1.5 bg-surface text-textSec text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0 hover:text-white transition-colors"
				>Timeout</button
			>
			<button
				class="px-3 py-1.5 bg-surface text-textSec text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0 hover:text-white transition-colors"
				>Deadlock</button
			>
			<button
				class="px-3 py-1.5 bg-surface text-textSec text-xs font-medium rounded-lg whitespace-nowrap flex-shrink-0 hover:text-white transition-colors"
				>Conn</button
			>
		</div>
		<div class="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5">
			<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
			<input
				type="text"
				placeholder={t('common_actions_search')}
				class="bg-transparent text-sm text-textMain placeholder-textSec outline-none flex-1"
			/>
		</div>
	</div>

	<div class="divide-y divide-surface/60">
		{#each errorLog as entry (entry.id)}
			<div class="px-4 py-3">
				<div class="flex items-start justify-between gap-2 mb-1">
					<div class="flex items-center gap-2 flex-wrap">
						<span class="px-2 py-0.5 {entry.typeClass} text-[10px] rounded font-medium"
							>{entry.type}</span
						>
						<span class="px-2 py-0.5 {entry.statusClass} text-[10px] rounded"
							>{t(entry.statusKey)}</span
						>
					</div>
					<span class="text-[10px] text-textSec font-mono flex-shrink-0">{entry.time}</span>
				</div>
				<p class="text-xs text-textMain mt-1 leading-relaxed">{entry.message}</p>
				<div class="flex items-center gap-3 mt-1.5">
					<span class="text-[10px] text-textSec font-mono">{entry.table}</span>
					<span class="{entry.durationClass} text-[10px] font-mono font-semibold"
						>{entry.duration}</span
					>
				</div>
			</div>
		{/each}
	</div>
</section>

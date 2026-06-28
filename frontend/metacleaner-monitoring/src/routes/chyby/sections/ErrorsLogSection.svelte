<script lang="ts">
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import ErrorLogRow from '../components/ErrorLogRow.svelte';
	import { getErrorLog } from '$lib/repositories/errorsRepository';

	const logEntries = getErrorLog();

	let activeFilter = $state('all');

	const errorFilters = [
		{ value: 'all', labelKey: 'errors_filters_all' },
		{ value: '5xx', labelKey: 'errors_filters_5xx' },
		{ value: 'js', labelKey: 'errors_filters_js' },
		{ value: 'backend', labelKey: 'errors_filters_backend' },
		{ value: 'timeout', labelKey: 'errors_filters_timeout' }
	];
</script>

<!-- Desktop: log table card -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
		<h3 class="text-lg font-semibold text-textMain">{t('errors_log_title')}</h3>
		<div class="flex gap-3 flex-wrap">
			<div class="flex rounded-lg overflow-hidden border border-border">
				{#each errorFilters as filter (filter.value)}
					<button
						class="px-3 py-1.5 text-xs font-medium transition-colors {activeFilter === filter.value
							? 'bg-error/20 text-error'
							: 'bg-transparent text-textSec hover:bg-surface'}"
						onclick={() => (activeFilter = filter.value)}>{t(filter.labelKey)}</button
					>
				{/each}
			</div>
			<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
				<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
				<input
					type="text"
					placeholder={t('errors_log_searchPlaceholder')}
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
						>{t('common_table_endpoint')} / {t('common_table_source')}</th
					>
					<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3"
						>{t('common_table_status')}</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface/60">
				{#each logEntries as entry (entry.id)}
					<ErrorLogRow {entry} variant="desktop" />
				{/each}
			</tbody>
		</table>
	</div>
</section>

<!-- Mobile: log cards -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4 mb-24">
	<div class="flex items-center justify-between mb-3">
		<h3 class="text-sm font-semibold text-textMain">{t('errors_mobile_logTitle')}</h3>
		<span class="text-[10px] text-textSec">{logEntries.length} {t('common_labels_entries')}</span>
	</div>

	<!-- Search -->
	<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 mb-3">
		<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
		<input
			type="text"
			placeholder={t('errors_log_searchPlaceholder')}
			class="bg-transparent text-xs text-textMain placeholder-textSec outline-none flex-1"
		/>
	</div>

	<!-- Filter pills -->
	<div class="flex gap-1.5 mb-4 overflow-x-auto pb-1">
		{#each errorFilters as filter (filter.value)}
			<button
				class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
				style="min-height:36px"
				onclick={() => (activeFilter = filter.value)}
				style:background-color={activeFilter === filter.value
					? 'rgba(239,68,68,0.2)'
					: chartColors.surface}
				style:color={activeFilter === filter.value ? chartColors.error : chartColors.textSec}
			>
				{t(filter.labelKey)}
			</button>
		{/each}
	</div>

	<!-- Log cards -->
	<div class="space-y-3">
		{#each logEntries as entry (entry.id)}
			<ErrorLogRow {entry} variant="mobile" />
		{/each}
	</div>
</section>

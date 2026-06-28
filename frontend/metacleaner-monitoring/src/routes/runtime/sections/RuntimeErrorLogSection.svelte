<script lang="ts">
	import { t } from '$lib/i18n';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import type { RuntimeErrorEntry } from '$lib/repositories/runtimeRepository';

	let { errors }: { errors: RuntimeErrorEntry[] } = $props();

	const errorLog = $derived(errors);
	let open = $state(true);
</script>

<!-- Desktop: error log table card (spans 2 cols when used in a 3-col grid) -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5 lg:col-span-2">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('runtime_errorLog_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('runtime_errorLog_subtitle')}</p>
		</div>
		<div class="flex gap-3 flex-wrap">
			<div class="flex rounded-lg overflow-hidden border border-border">
				<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium"
					>{t('runtime_filters_all')}</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>OOM</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Crash</button
				>
				<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Health</button
				>
			</div>
			<div class="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
				<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
				<input
					type="text"
					placeholder={t('runtime_errorLog_searchPlaceholder')}
					class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-28"
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
						>{t('runtime_table_instance')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('common_table_type')}</th
					>
					<th
						class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4"
						>{t('common_table_message')}</th
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
						<td class="py-3 pr-4 text-textSec font-mono text-xs">{entry.machine}</td>
						<td class="py-3 pr-4"
							><span class="px-2 py-0.5 {entry.levelClass} text-xs rounded font-medium"
								>{entry.level}</span
							></td
						>
						<td class="py-3 pr-4 text-textMain max-w-xs truncate text-xs">{entry.message}</td>
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
</div>

<!-- Mobile: accordion with filter pills + card list -->
<div class="lg:hidden">
	<AccordionSection
		title={t('runtime_errorLog_title')}
		icon="fa-triangle-exclamation"
		{open}
		ontoggle={() => (open = !open)}
	>
		{#snippet headerRight()}
			<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-bold"
				>{errorLog.length}</span
			>
		{/snippet}
		<div class="flex gap-2 mb-4">
			<div class="flex rounded-lg overflow-hidden border border-border flex-1">
				<button class="flex-1 py-2 bg-error/20 text-error text-xs font-medium"
					>{t('common_status_all')}</button
				>
				<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>OOM</button
				>
				<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Crash</button
				>
				<button class="flex-1 py-2 bg-transparent text-textSec text-xs font-medium hover:bg-surface"
					>Health</button
				>
			</div>
		</div>
		<div class="space-y-2">
			{#each errorLog as entry (entry.id)}
				<div class="p-3 rounded-xl bg-surface/40 border {entry.borderClass}">
					<div class="flex items-center justify-between mb-1.5">
						<div class="flex items-center gap-2">
							<span class="px-1.5 py-0.5 {entry.levelClass} text-xs rounded font-medium"
								>{entry.level}</span
							>
							<span class="text-xs text-textSec font-mono">{entry.machine}</span>
						</div>
						<span class="text-xs text-textSec font-mono">{entry.time}</span>
					</div>
					<p class="text-xs text-textMain">{entry.message}</p>
					<div class="mt-1.5">
						<span class="px-1.5 py-0.5 {entry.statusClass} text-xs rounded"
							>{t(entry.statusKey)}</span
						>
					</div>
				</div>
			{/each}
		</div>
	</AccordionSection>
</div>

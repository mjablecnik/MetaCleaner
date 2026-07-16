<script lang="ts">
	import { t } from '$lib/i18n';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import TableSizeRow from '../components/TableSizeRow.svelte';
	import type { TableSize } from '$lib/repositories/databaseRepository';

	let { tableSizes }: { tableSizes: TableSize[] } = $props();

	let tableSizesOpen = $state(false);
</script>

<!-- Desktop: Table Sizes -->
<section class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('database_tableSizes_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('database_tableSizes_subtitle')}</p>
		</div>
	</div>
	<div class="space-y-3">
		{#each tableSizes as ts (ts.name)}
			<TableSizeRow tableSize={ts} variant="desktop" />
		{/each}
	</div>
</section>

<!-- Mobile: Table Sizes accordion -->
<div class="lg:hidden">
	<AccordionSection
		title={t('database_tableSizes_title')}
		open={tableSizesOpen}
		ontoggle={() => (tableSizesOpen = !tableSizesOpen)}
	>
		<div class="space-y-3">
			{#each tableSizes as ts (ts.name)}
				<TableSizeRow tableSize={ts} variant="mobile" />
			{/each}
		</div>
	</AccordionSection>
</div>

<script lang="ts">
	import { t } from '$lib/i18n';
	import { getCacheRules } from '$lib/repositories/edgeRepository';
	import CacheRuleItem from '../components/CacheRuleItem.svelte';

	const cacheRules = getCacheRules();
	let cacheRulesOpen = $state(false);
</script>

<!-- Desktop: Cache Rules -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('edge_cacheRules_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('edge_cacheRules_subtitle')}</p>
		</div>
		<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('edge_cacheRules_badge')}</span>
	</div>
	<div class="space-y-3">
		{#each cacheRules as rule (rule.id)}
			<CacheRuleItem {rule} variant="desktop" />
		{/each}
	</div>
</div>

<!-- Mobile: Cache Rules accordion -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<button
		onclick={() => (cacheRulesOpen = !cacheRulesOpen)}
		class="w-full flex items-center justify-between p-4 text-left"
	>
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-green-muted/15 flex items-center justify-center">
				<i class="fa-solid fa-image text-green-muted text-xs"></i>
			</div>
			<div>
				<p class="text-sm font-semibold text-textMain">{t('edge_cacheRules_title')}</p>
				<p class="text-[10px] text-textSec">{t('edge_cacheRules_subtitleMobile')}</p>
			</div>
		</div>
		<i
			class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-200 {cacheRulesOpen
				? 'rotate-180'
				: ''}"
		></i>
	</button>
	{#if cacheRulesOpen}
		<div class="px-4 pb-4 space-y-2.5">
			{#each cacheRules as rule (rule.id)}
				<CacheRuleItem {rule} variant="mobile" />
			{/each}
		</div>
	{/if}
</section>

<script lang="ts">
	import { t } from '$lib/i18n';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import DeployItem from '../components/DeployItem.svelte';
	import { getDeployHistory } from '$lib/repositories/runtimeRepository';

	const deploys = getDeployHistory();

	let open = $state(false);
</script>

<!-- Desktop: deploy history card -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<div>
			<h3 class="text-lg font-semibold text-textMain">{t('runtime_deploys_title')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('runtime_deploys_subtitle')}</p>
		</div>
		<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">{t('runtime_deploys_badge')}</span>
	</div>
	<div class="space-y-3">
		{#each deploys as deploy (deploy.id)}
			<DeployItem {deploy} variant="desktop" />
		{/each}
	</div>
</div>

<!-- Mobile: accordion -->
<div class="lg:hidden">
	<AccordionSection
		title={t('runtime_deploys_title')}
		icon="fa-rocket"
		{open}
		ontoggle={() => (open = !open)}
	>
		{#snippet children()}
			<div class="space-y-0">
				{#each deploys as deploy, i (deploy.id)}
					<DeployItem {deploy} variant="mobile" showDivider={i < deploys.length - 1} />
				{/each}
			</div>
		{/snippet}
	</AccordionSection>
</div>

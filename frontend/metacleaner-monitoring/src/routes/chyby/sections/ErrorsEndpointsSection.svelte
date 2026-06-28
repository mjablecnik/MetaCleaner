<script lang="ts">
	import { t } from '$lib/i18n';
	import AccordionSection from '$lib/shared/elements/AccordionSection.svelte';
	import ErrorEndpointRow from '../components/ErrorEndpointRow.svelte';
	import type { TopEndpoint } from '$lib/repositories/errorsRepository';

	let { endpoints }: { endpoints: TopEndpoint[] } = $props();

	let endpointsOpen = $state(true);
</script>

<!-- Desktop: endpoints card -->
<div class="hidden lg:block bg-card border border-surface rounded-xl p-5">
	<div class="flex justify-between items-center mb-4">
		<h3 class="text-lg font-semibold text-textMain">{t('errors_endpoints_title')}</h3>
		<span class="text-xs text-textSec">{t('errors_endpoints_subtitle')}</span>
	</div>
	<div class="space-y-3">
		{#each endpoints as ep (ep.path)}
			<ErrorEndpointRow endpoint={ep} variant="desktop" />
		{/each}
	</div>
</div>

<!-- Mobile: endpoints accordion -->
<div class="lg:hidden">
	<AccordionSection
		title={t('errors_endpoints_title')}
		open={endpointsOpen}
		ontoggle={() => (endpointsOpen = !endpointsOpen)}
	>
		<div class="space-y-2.5">
			{#each endpoints as ep (ep.path)}
				<ErrorEndpointRow endpoint={ep} variant="mobile" />
			{/each}
		</div>
	</AccordionSection>
</div>

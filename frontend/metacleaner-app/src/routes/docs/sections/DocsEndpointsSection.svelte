<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import EndpointCard from '../components/EndpointCard.svelte';
	import { getEndpoints } from '$lib/repositories/docsRepository';

	const endpoints = getEndpoints();
</script>

<section class="mb-12">
	<!-- Section header -->
	<div class="mb-6 flex items-start gap-4">
		<div
			class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/30 bg-brand-blue/20"
		>
			<i class="fa-solid fa-code text-xs text-brand-blue"></i>
		</div>
		<div>
			<h2 class="text-2xl font-bold text-white">{tx('docs.endpoints.title')}</h2>
			<p class="text-xs text-text-muted">{tx('docs.endpoints.subtitle')}</p>
		</div>
	</div>

	<!-- Endpoint cards -->
	{#each endpoints as endpoint, i (endpoint.id)}
		<EndpointCard {endpoint} initialOpen={i === 0} />
	{/each}
</section>

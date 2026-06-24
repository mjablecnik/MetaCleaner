<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import EndpointCard from '../components/EndpointCard.svelte';
	import { getEndpoints } from '$lib/repositories/docsRepository';

	const endpoints = getEndpoints();

	const targetId = $derived(page.url.hash ? page.url.hash.slice(1) : '');

	// Track which endpoint should be force-opened from sidebar click
	let activeEndpointId = $state('');

	$effect(() => {
		if (targetId) {
			activeEndpointId = targetId;
			// Scroll to the target endpoint card
			requestAnimationFrame(() => {
				const el = document.getElementById(targetId);
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			});
		}
	});

	onMount(() => {
		if (targetId) {
			activeEndpointId = targetId;
		}
	});
</script>

<section class="mb-12">
	<!-- Section header -->
	<div class="mb-6 flex items-start gap-4">
		<div
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-blue/30 bg-brand-blue/20"
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
		<EndpointCard
			{endpoint}
			initialOpen={activeEndpointId ? endpoint.id === activeEndpointId : i === 0}
			forceOpen={endpoint.id === activeEndpointId}
		/>
	{/each}
</section>

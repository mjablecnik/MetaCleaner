<script lang="ts">
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { authStore } from '$lib/auth/auth.svelte';

	onMount(() => {
		// Refresh subscription status after successful checkout
		authStore.fetchSubscription();
	});
</script>

<svelte:head>
	<title>{tx('pricing.success.meta.title')}</title>
</svelte:head>

<div class="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
	<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/15">
		<i class="fa-solid fa-circle-check text-4xl text-brand-green"></i>
	</div>

	<h1 class="mb-3 text-3xl font-bold">{tx('pricing.success.title')}</h1>
	<p class="mb-8 max-w-md text-base text-text-muted">{tx('pricing.success.description')}</p>

	<a
		href={resolve('/' as Pathname)}
		class="flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
	>
		<i class="fa-solid fa-arrow-right"></i>
		{tx('pricing.success.backToCleaning')}
	</a>
</div>

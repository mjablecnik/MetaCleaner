<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
</script>

<svelte:head>
	<title>{tx('pricing.success.meta.title')}</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
	<div class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/15 mb-6">
		<i class="fa-solid fa-circle-check text-4xl text-brand-green"></i>
	</div>

	<h1 class="text-3xl font-bold mb-3">{tx('pricing.success.title')}</h1>
	<p class="text-text-muted text-base max-w-md mb-8">{tx('pricing.success.description')}</p>

	<a
		href={resolve('/' as Pathname)}
		class="flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
	>
		<i class="fa-solid fa-arrow-right"></i>
		{tx('pricing.success.backToCleaning')}
	</a>
</div>

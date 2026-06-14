<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { tx } from '$lib/shared/utils/i18n';
</script>

<main
	class="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-main p-8 text-white"
>
	<i class="fa-solid fa-triangle-exclamation text-4xl text-brand-orange"></i>
	<h1 class="text-2xl font-bold">{tx('error.page.title')}</h1>
	<p class="text-sm text-text-muted">{page.error?.message ?? tx('error.page.defaultMessage')}</p>
	<button
		class="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
		onclick={() => goto(resolve('/' as Pathname))}
	>
		{tx('error.page.goHome')}
	</button>
</main>

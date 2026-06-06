<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { appState } from '$lib/stores/appState.svelte';
	import Step1Idle from './sections/Step1Idle/Step1Idle.svelte';
	import Step2FilesReady from './sections/Step2FilesReady/Step2FilesReady.svelte';
	import Step3Processing from './sections/Step3Processing/Step3Processing.svelte';
	import Step4Error from './sections/Step4Error/Step4Error.svelte';
	import Step5Success from './sections/Step5Success/Step5Success.svelte';

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}

	const state = $derived(appState.current);
	const metaTitleKey = $derived(
		state === 'processing'
			? 'step3.meta.title'
			: state === 'error'
				? 'step4.meta.title'
				: state === 'success'
					? 'step5.meta.title'
					: state === 'files-ready'
						? 'step2.meta.title'
						: 'step1.meta.title'
	);
</script>

<svelte:head>
	<title>{tx(metaTitleKey)}</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-4 px-4 pb-24 lg:mt-0 lg:gap-6 lg:px-6"
>
	{#if state === 'idle' || state === 'files-ready'}
		<div class="mb-0 flex flex-col gap-1 lg:mb-2">
			<h1 class="text-2xl font-bold text-white lg:text-3xl">{tx('step1.header.title')}</h1>
			<p class="mt-1 text-sm text-text-muted">{tx('step1.header.description')}</p>
		</div>
	{/if}

	{#if state === 'idle'}
		<Step1Idle />
	{:else if state === 'files-ready'}
		<Step2FilesReady />
	{:else if state === 'processing'}
		<Step3Processing />
	{:else if state === 'error'}
		<Step4Error />
	{:else if state === 'success'}
		<Step5Success />
	{/if}
</main>

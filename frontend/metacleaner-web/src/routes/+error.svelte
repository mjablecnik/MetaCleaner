<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages';
	import CtaButton from '$lib/components/elements/CtaButton.svelte';
	import GradientText from '$lib/components/elements/GradientText.svelte';

	const is404 = $derived($page.status === 404);
</script>

<svelte:head>
	<title>{is404 ? m.error_404_title() : 'Error | MetaCleaner'}</title>
</svelte:head>

<div class="flex flex-col items-center w-full min-h-screen">
	<main
		class="flex flex-col items-center justify-center flex-1 w-full max-w-site mx-auto px-6 py-20 text-center relative overflow-hidden"
	>
		<!-- Decorative gradient glow orb -->
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/10 blur-[var(--blur-glow)] pointer-events-none"
		></div>

		<div class="relative z-10 flex flex-col items-center gap-6">
			{#if is404}
				<p class="text-9xl font-black leading-none">
					<GradientText>404</GradientText>
				</p>
				<p class="text-2xl font-semibold text-text-main">{m.error_404_message()}</p>
			{:else}
				<p class="text-9xl font-black leading-none">
					<GradientText>{$page.status}</GradientText>
				</p>
				<p class="text-2xl font-semibold text-text-main">Something went wrong.</p>
			{/if}

			<CtaButton href="/" label={m.error_404_cta()} variant="primary" icon="fa-solid fa-house" />
		</div>
	</main>
</div>

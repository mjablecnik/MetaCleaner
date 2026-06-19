<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import CtaButton from '$lib/components/elements/CtaButton.svelte';
</script>

<section id="cta-section" class="w-full max-w-site mx-auto mt-4 mb-6 md:mb-12 px-6">
	<div
		class="bg-gradient-to-br from-brand-blue/20 to-brand-green/10 rounded-2xl border border-brand-blue/30 p-6 md:p-10 text-center"
	>
		<h2 class="text-xl md:text-3xl font-bold mb-2 md:mb-3">{m.features_cta_title()}</h2>
		<p class="text-text-muted text-sm md:text-base mb-5 md:mb-8">{m.features_cta_subtitle()}</p>
		<div class="flex justify-center">
			<CtaButton variant="primary" label={m.cta_try_free()} href="#" size="sm" />
		</div>
	</div>
</section>

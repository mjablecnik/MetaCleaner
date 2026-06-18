<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import CtaButton from '$lib/components/elements/CtaButton.svelte';
</script>

<!-- Mobile CTA Section -->
<section id="cta-section" class="md:hidden w-full mt-4 mb-6 px-4">
	<div
		class="bg-gradient-to-br from-brand-blue/20 to-brand-green/10 rounded-2xl border border-brand-blue/30 p-6 text-center"
	>
		<h2 class="text-xl font-bold mb-2">{m.features_cta_title()}</h2>
		<p class="text-text-muted text-sm mb-5">{m.features_cta_subtitle()}</p>
		<CtaButton variant="primary" label={m.cta_try_free()} href="#" size="sm" fullWidth />
	</div>
</section>

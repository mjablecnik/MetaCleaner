<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import GradientText from '$lib/components/elements/GradientText.svelte';
</script>

<section
	id="features-header"
	class="w-full max-w-site mx-auto px-6 text-center pt-8 pb-6 md:pb-0"
>
	<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
		>{m.features_eyebrow()}</span
	>
	<h1 class="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
		{m.features_title_line1()}<br />
		<GradientText>{m.features_title_line2()}</GradientText>
	</h1>
	<p class="text-text-muted text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
		{m.features_subtitle()}
	</p>
</section>

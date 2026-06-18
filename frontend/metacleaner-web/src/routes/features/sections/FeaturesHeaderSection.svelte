<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import GradientText from '$lib/components/elements/GradientText.svelte';
</script>

<!-- Desktop Features Header -->
<section
	id="features-header"
	class="hidden md:block w-full max-w-site mx-auto px-6 text-center pt-8"
>
	<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
		>{m.features_eyebrow()}</span
	>
	<h1 class="text-5xl font-bold mb-4 leading-tight">
		{m.features_title_line1()}<br />
		<GradientText>{m.features_title_line2()}</GradientText>
	</h1>
	<p class="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
		{m.features_subtitle()}
	</p>
</section>

<!-- Mobile Features Header -->
<section class="md:hidden w-full text-center pt-8 pb-6 px-6">
	<span class="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3 block"
		>{m.features_eyebrow()}</span
	>
	<h1 class="text-3xl font-bold mb-3 leading-tight">
		{m.features_title_line1()}<br />
		<GradientText>{m.features_title_line2()}</GradientText>
	</h1>
	<p class="text-text-muted text-sm leading-relaxed">
		{m.features_subtitle()}
	</p>
</section>

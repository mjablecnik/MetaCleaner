<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.meta_terms_title()}</title>
	<meta name="description" content={m.meta_terms_description()} />
</svelte:head>

<div class="flex flex-col items-center w-full">
	<main class="flex flex-col items-center flex-1 w-full max-w-site mx-auto px-6 py-12 md:py-20">
		<div class="w-full max-w-3xl">
			<h1 class="text-4xl font-bold text-text-main mb-6">{m.terms_heading()}</h1>
			<p class="text-text-muted leading-relaxed mb-10">{m.terms_intro()}</p>

			<div class="prose prose-invert prose-slate max-w-none">
				<h2>{m.terms_section1_title()}</h2>
				<p>{m.terms_section1_content()}</p>

				<h2>{m.terms_section2_title()}</h2>
				<p>{m.terms_section2_content()}</p>

				<h2>{m.terms_section3_title()}</h2>
				<p>{m.terms_section3_content()}</p>

				<h2>{m.terms_section4_title()}</h2>
				<p>{m.terms_section4_content()}</p>

				<h2>{m.terms_section5_title()}</h2>
				<p>{m.terms_section5_content()}</p>
			</div>
		</div>
	</main>
</div>

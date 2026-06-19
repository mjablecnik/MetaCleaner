<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.meta_privacy_title()}</title>
	<meta name="description" content={m.meta_privacy_description()} />
</svelte:head>

<div class="flex flex-col items-center w-full min-h-screen">
	<main class="flex flex-col items-center flex-1 w-full max-w-site mx-auto px-6 py-12 md:py-20">
		<div class="w-full max-w-3xl">
			<h1 class="text-4xl font-bold text-text-main mb-6">{m.privacy_heading()}</h1>
			<p class="text-text-muted leading-relaxed mb-10">{m.privacy_intro()}</p>

			<div class="prose prose-invert prose-slate max-w-none">
				<h2>{m.privacy_section1_title()}</h2>
				<p>{m.privacy_section1_content()}</p>

				<h2>{m.privacy_section2_title()}</h2>
				<p>{m.privacy_section2_content()}</p>

				<h2>{m.privacy_section3_title()}</h2>
				<p>{m.privacy_section3_content()}</p>

				<h2>{m.privacy_section4_title()}</h2>
				<p>{m.privacy_section4_content()}</p>

				<h2>{m.privacy_section5_title()}</h2>
				<p>{m.privacy_section5_content()}</p>
			</div>
		</div>
	</main>
</div>

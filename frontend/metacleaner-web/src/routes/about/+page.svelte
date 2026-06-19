<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import SectionHeading from '$lib/components/elements/SectionHeading.svelte';
</script>

<svelte:head>
	<title>{m.meta_about_title()}</title>
	<meta name="description" content={m.meta_about_description()} />
</svelte:head>

<div class="flex flex-col items-center w-full min-h-screen">
	<main class="flex flex-col items-center flex-1 w-full max-w-site mx-auto px-6 py-12 md:py-20">
		<SectionHeading title={m.about_heading()} />

		<div class="w-full max-w-2xl text-center">
			<p class="text-text-muted text-lg leading-relaxed mb-6">{m.about_description_p1()}</p>
			<p class="text-text-muted text-lg leading-relaxed mb-12">{m.about_description_p2()}</p>

			<div class="border border-border rounded-xl p-8 bg-navy-card">
				<h2 class="text-xl font-bold text-text-main mb-4">{m.about_contact_heading()}</h2>
				<p class="text-text-muted">
					{m.about_contact_email_label()}:
					<a
						href="mailto:{m.about_contact_email()}"
						class="text-brand-blue hover:text-blue-400 transition-colors ml-1"
					>
						{m.about_contact_email()}
					</a>
				</p>
			</div>
		</div>
	</main>
</div>

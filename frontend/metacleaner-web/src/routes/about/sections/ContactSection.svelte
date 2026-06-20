<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import ContactInfoCard from '../components/ContactInfoCard.svelte';
	import ResponseTimeCard from '../components/ResponseTimeCard.svelte';
	import ContactForm from '../components/ContactForm.svelte';
</script>

<section id="contact" class="w-full max-w-site mx-auto px-6 py-12 md:py-20">
	<div class="flex flex-col items-center text-center gap-3 mb-10">
		<span class="text-xs font-semibold uppercase tracking-widest text-brand-blue">
			{m.about_contact_label()}
		</span>

		<h2 class="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
			{m.about_contact_heading()}
		</h2>

		<p class="text-sm md:text-base text-text-muted max-w-xl">
			{m.about_contact_subtitle()}
		</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
		<div class="lg:col-span-2 flex flex-col gap-4">
			<ContactInfoCard />
			<ResponseTimeCard />
		</div>

		<div class="lg:col-span-3">
			<ContactForm />
		</div>
	</div>
</section>

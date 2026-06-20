<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import ValueCard from '../components/ValueCard.svelte';

	const values = [
		{
			icon: 'fa-solid fa-lock',
			title: m.about_values_privacy_title(),
			description: m.about_values_privacy_desc(),
			hoverColor: 'brand-blue' as const
		},
		{
			icon: 'fa-solid fa-eye-slash',
			title: m.about_values_transparency_title(),
			description: m.about_values_transparency_desc(),
			hoverColor: 'brand-green' as const
		},
		{
			icon: 'fa-solid fa-universal-access',
			title: m.about_values_accessibility_title(),
			description: m.about_values_accessibility_desc(),
			hoverColor: 'brand-orange' as const
		},
		{
			icon: 'fa-solid fa-code',
			title: m.about_values_opensource_title(),
			description: m.about_values_opensource_desc(),
			hoverColor: 'brand-blue' as const
		},
		{
			icon: 'fa-solid fa-shield-halved',
			title: m.about_values_security_title(),
			description: m.about_values_security_desc(),
			hoverColor: 'brand-green' as const
		},
		{
			icon: 'fa-solid fa-lightbulb',
			title: m.about_values_innovation_title(),
			description: m.about_values_innovation_desc(),
			hoverColor: 'brand-orange' as const
		}
	];
</script>

<section class="w-full max-w-site mx-auto px-6 py-12 md:py-20">
	<div class="flex flex-col items-center text-center gap-3 mb-10">
		<span class="text-xs font-semibold uppercase tracking-widest text-brand-orange">
			{m.about_values_label()}
		</span>

		<h2 class="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
			{m.about_values_heading()}
		</h2>

		<p class="text-sm md:text-base text-text-muted max-w-xl">
			{m.about_values_subtitle()}
		</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each values as value (value.icon)}
			<ValueCard
				icon={value.icon}
				title={value.title}
				description={value.description}
				hoverColor={value.hoverColor}
			/>
		{/each}
	</div>
</section>

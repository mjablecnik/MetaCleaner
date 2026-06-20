<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import GradientText from '$lib/components/elements/GradientText.svelte';
	import StatCard from '../components/StatCard.svelte';

	const stats = [
		{ value: '50K+', label: m.about_hero_stat_users(), colorClass: 'text-white' },
		{ value: '2M+', label: m.about_hero_stat_files(), colorClass: 'text-brand-green' },
		{ value: '100%', label: m.about_hero_stat_local(), colorClass: 'text-brand-blue' },
		{ value: '4.9★', label: m.about_hero_stat_rating(), colorClass: 'text-brand-orange' },
	];
</script>

<section class="w-full max-w-site mx-auto px-6 pt-8 md:pt-16 pb-8 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
	<div class="w-full lg:w-[55%] flex flex-col gap-4">
		<span class="text-xs font-semibold uppercase tracking-widest text-brand-blue">
			{m.about_hero_label()}
		</span>

		<h1 class="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
			<span>{m.about_hero_title_line1()}</span><br />
			<GradientText>{m.about_hero_title_line2()}</GradientText>
		</h1>

		<p class="text-sm md:text-lg text-text-muted leading-relaxed max-w-xl">
			{m.about_hero_description()}
		</p>

		<div class="flex flex-wrap gap-3 mt-2">
			<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
				<i class="fa-solid fa-calendar-days text-brand-blue text-xs"></i>
				<span class="text-xs font-medium text-text-muted">{m.about_hero_badge_founded()}</span>
			</div>
			<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
				<i class="fa-solid fa-location-dot text-brand-blue text-xs"></i>
				<span class="text-xs font-medium text-text-muted">{m.about_hero_badge_location()}</span>
			</div>
		</div>
	</div>

	<div class="w-full lg:w-[45%]">
		<div class="border border-border rounded-2xl bg-navy-card p-6">
			<div class="grid grid-cols-2 gap-4">
				{#each stats as stat}
					<StatCard value={stat.value} label={stat.label} colorClass={stat.colorClass} />
				{/each}
			</div>
		</div>
	</div>
</section>

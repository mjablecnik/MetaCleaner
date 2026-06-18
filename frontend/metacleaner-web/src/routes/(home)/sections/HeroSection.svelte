<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import GradientText from '$lib/components/elements/GradientText.svelte';
	import CtaButton from '$lib/components/elements/CtaButton.svelte';
	import UploadCard from '../components/UploadCard.svelte';
</script>

<section
	id="hero"
	class="w-full max-w-site mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center"
>
	<div class="w-full lg:w-[55%] flex flex-col gap-4 md:gap-6">
		<!-- Badge: mobile only -->
		<div
			class="md:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 w-fit"
		>
			<i class="fa-solid fa-lock text-brand-blue text-xs"></i>
			<span class="text-xs font-semibold text-brand-blue">{m.home_hero_badge()}</span>
		</div>

		<h1
			class="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-[1.1] tracking-tight"
		>
			<span>{m.home_hero_title_line1()}</span><br />
			<GradientText>{m.home_hero_title_line2()}</GradientText>
		</h1>

		<p class="text-sm md:text-lg text-text-muted leading-relaxed max-w-xl">
			{m.home_hero_subtitle()}
		</p>

		<div class="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2 md:mt-4">
			<div class="w-full sm:w-auto">
				<CtaButton
					variant="primary"
					icon="fa-solid fa-cloud-arrow-up"
					label={m.cta_try_free()}
					href="#"
					fullWidth
				/>
			</div>
			<div class="w-full sm:w-auto">
				<CtaButton
					variant="secondary"
					icon="fa-brands fa-apple"
					label={m.cta_download_app()}
					href="#"
					fullWidth
				/>
			</div>
		</div>
	</div>

	<div class="w-full lg:w-[45%] md:h-[400px]">
		<UploadCard />
	</div>
</section>

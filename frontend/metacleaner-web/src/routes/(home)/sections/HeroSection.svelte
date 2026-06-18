<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import GradientText from '$lib/components/elements/GradientText.svelte';
	import CtaButton from '$lib/components/elements/CtaButton.svelte';
	import UploadCard from '../components/UploadCard.svelte';
</script>

<!-- Desktop Hero -->
<section
	id="hero"
	class="hidden md:flex w-full max-w-site mx-auto px-6 pt-12 pb-8 flex-col lg:flex-row gap-12 items-center"
>
	<div class="w-full lg:w-[55%] flex flex-col gap-6">
		<h1 class="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight w-[609px]">
			<span>{m.home_hero_title_line1()}</span><br />
			<GradientText>{m.home_hero_title_line2()}</GradientText>
		</h1>
		<p class="text-lg text-text-muted leading-relaxed max-w-xl">
			{m.home_hero_subtitle()}
		</p>
		<div class="flex flex-col sm:flex-row gap-4 mt-4">
			<CtaButton
				variant="primary"
				icon="fa-solid fa-cloud-arrow-up"
				label={m.cta_try_free()}
				href="#"
			/>
			<CtaButton
				variant="secondary"
				icon="fa-brands fa-apple"
				label={m.cta_download_app()}
				href="#"
			/>
		</div>
	</div>
	<div class="w-full lg:w-[45%] h-[400px]">
		<UploadCard size="desktop" />
	</div>
</section>

<!-- Mobile Hero -->
<section id="hero-mobile" class="md:hidden w-full max-w-md mx-auto px-4 pt-8 flex flex-col gap-5">
	<div class="flex flex-col gap-4">
		<div
			class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 w-fit"
		>
			<i class="fa-solid fa-lock text-brand-blue text-xs"></i>
			<span class="text-xs font-semibold text-brand-blue">{m.home_hero_badge()}</span>
		</div>
		<h1 class="text-3xl font-bold leading-tight tracking-tight">
			{m.home_hero_title_line1()}<br />
			<GradientText>{m.home_hero_title_line2()}</GradientText>
		</h1>
		<p class="text-sm text-text-muted leading-relaxed">
			{m.home_hero_subtitle()}
		</p>
	</div>
	<UploadCard size="mobile" />
	<div class="flex flex-col gap-3">
		<CtaButton
			variant="primary"
			icon="fa-solid fa-cloud-arrow-up"
			label={m.cta_try_free()}
			href="#"
			size="sm"
			fullWidth
		/>
		<CtaButton
			variant="secondary"
			icon="fa-brands fa-apple"
			label={m.cta_download_app()}
			href="#"
			size="sm"
			fullWidth
		/>
	</div>
</section>

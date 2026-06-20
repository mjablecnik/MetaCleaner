<script lang="ts">
	import * as m from '$lib/paraglide/messages';
</script>

<section class="w-full max-w-site mx-auto px-6 py-12 md:py-20">
	<div class="flex flex-col lg:flex-row gap-8 lg:gap-16">
		<div class="w-full lg:w-1/3 flex flex-col gap-4">
			<span class="text-xs font-semibold uppercase tracking-widest text-brand-green">
				{m.about_story_label()}
			</span>

			<h2 class="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
				{m.about_story_heading()}
			</h2>

			<div
				class="h-0.5 w-24 rounded-full bg-gradient-to-r from-brand-blue to-brand-green mt-2"
			></div>
		</div>

		<div class="w-full lg:w-2/3 flex flex-col gap-5">
			<p class="text-sm md:text-base text-text-muted leading-relaxed">
				{m.about_story_p1()}
			</p>
			<p class="text-sm md:text-base text-text-muted leading-relaxed">
				{m.about_story_p2()}
			</p>
			<p class="text-sm md:text-base text-text-muted leading-relaxed">
				{m.about_story_p3()}
			</p>
		</div>
	</div>
</section>

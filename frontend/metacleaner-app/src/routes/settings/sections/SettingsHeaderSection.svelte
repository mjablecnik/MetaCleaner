<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
</script>

<div class="fade-in-up mb-4 flex items-center gap-3 lg:mb-6 lg:gap-4">
	<div
		class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-brand-blue/40 bg-brand-blue/10 lg:h-14 lg:w-14 lg:rounded-2xl"
	>
		<i class="fa-solid fa-gear text-xl text-brand-blue lg:text-3xl"></i>
	</div>
	<div>
		<h1 class="text-xl leading-tight font-bold text-white lg:text-3xl">
			{tx('settings.header.title')}
		</h1>
		<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
			{tx('settings.header.subtitle')}
		</p>
	</div>
</div>

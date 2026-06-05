<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		filesProcessed: number;
	}

	const { filesProcessed }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="fade-in-up flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-0 lg:mb-2">
	<div class="flex items-center gap-3 lg:gap-4">
		<div
			class="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-brand-green/10 border-2 border-brand-green/40 flex items-center justify-center check-pop flex-shrink-0"
		>
			<i class="fa-solid fa-circle-check text-brand-green text-2xl lg:text-3xl"></i>
		</div>
		<div>
			<h1 class="text-xl lg:text-3xl font-bold text-white leading-tight">
				{tx('step5.header.title')}
			</h1>
			<p class="text-text-muted text-xs lg:text-sm mt-0.5 lg:mt-1">
				<span class="hidden lg:inline">{tx('step5.header.descriptionDesktop', { count: filesProcessed })}</span>
				<span class="inline lg:hidden">{tx('step5.header.descriptionMobile', { count: filesProcessed })}</span>
			</p>
		</div>
	</div>
	<div class="flex items-center gap-3">
		<a
			href="/"
			class="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue font-semibold text-sm hover:bg-brand-blue/20 transition-all"
		>
			<i class="fa-solid fa-arrow-up-from-bracket"></i>
			<span>{tx('step5.actions.uploadNew')}</span>
		</a>
		<div class="flex items-center gap-2 bg-brand-green/10 border border-brand-green/30 rounded-xl px-4 py-2.5">
			<div class="w-2 h-2 rounded-full bg-brand-green"></div>
			<span class="text-xs font-semibold text-brand-green">{tx('step5.badge.success')}</span>
		</div>
	</div>
</div>

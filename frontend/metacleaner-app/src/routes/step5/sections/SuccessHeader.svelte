<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		filesProcessed: number;
	}

	const { filesProcessed }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="fade-in-up mb-0 flex flex-col gap-4 lg:mb-2 lg:flex-row lg:items-center lg:justify-between"
>
	<div class="flex items-center gap-3 lg:gap-4">
		<div
			class="check-pop flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-brand-green/40 bg-brand-green/10 lg:h-14 lg:w-14"
		>
			<i class="fa-solid fa-circle-check text-2xl text-brand-green lg:text-3xl"></i>
		</div>
		<div>
			<h1 class="text-xl leading-tight font-bold text-white lg:text-3xl">
				{tx('step5.header.title')}
			</h1>
			<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
				<span class="hidden lg:inline"
					>{tx('step5.header.descriptionDesktop', { count: filesProcessed })}</span
				>
				<span class="inline lg:hidden"
					>{tx('step5.header.descriptionMobile', { count: filesProcessed })}</span
				>
			</p>
		</div>
	</div>
	<div class="flex items-center gap-3">
		<a
			href={resolve('/' as Pathname)}
			class="hidden items-center gap-2 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-4 py-2.5 text-sm font-semibold text-brand-blue transition-all hover:bg-brand-blue/20 lg:flex"
		>
			<i class="fa-solid fa-arrow-up-from-bracket"></i>
			<span>{tx('step5.actions.uploadNew')}</span>
		</a>
		<div
			class="flex items-center gap-2 rounded-xl border border-brand-green/30 bg-brand-green/10 px-4 py-2.5"
		>
			<div class="h-2 w-2 rounded-full bg-brand-green"></div>
			<span class="text-xs font-semibold text-brand-green">{tx('step5.badge.success')}</span>
		</div>
	</div>
</div>

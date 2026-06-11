<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { AuthStat } from '$lib/repositories/authRepository';

	interface Props {
		headline: string;
		highlightedWord: string;
		beforeHighlight?: string;
		afterWord?: string;
		description: string;
		stats?: AuthStat[];
	}

	let { headline, highlightedWord, beforeHighlight, afterWord, description, stats }: Props =
		$props();

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}
</script>

<div class="mb-6 flex flex-col items-center text-center lg:hidden">
	<h1 class="mb-2 text-2xl font-black leading-tight text-white">
		{headline}{#if beforeHighlight} {beforeHighlight}{/if} <span class="text-brand-green">{highlightedWord}</span>{#if afterWord} {afterWord}{/if}
	</h1>
	<p class="max-w-xs text-xs leading-relaxed text-text-muted">{description}</p>

	{#if stats && stats.length >= 3}
		<div class="mt-4 flex w-full max-w-xs items-center justify-center">
			<div class="flex-1 text-center">
				<p class="text-lg font-black text-white">{stats[0].value}</p>
				<p class="text-[10px] text-text-muted">{tx(stats[0].labelKey)}</p>
			</div>
			<div class="h-8 w-px bg-gray-800"></div>
			<div class="flex-1 text-center">
				<p class="text-lg font-black text-brand-green">{stats[1].value}</p>
				<p class="text-[10px] text-text-muted">{tx(stats[1].labelKey)}</p>
			</div>
			<div class="h-8 w-px bg-gray-800"></div>
			<div class="flex-1 text-center">
				<p class="text-lg font-black text-brand-blue">{stats[2].value}</p>
				<p class="text-[10px] text-text-muted">{tx(stats[2].labelKey)}</p>
			</div>
		</div>
	{/if}
</div>

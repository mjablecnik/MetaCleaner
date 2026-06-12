<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AuthStat } from '$lib/repositories/authRepository';
	import AuthStatsRow from './AuthStatsRow.svelte';

	interface Props {
		headline: string;
		highlightedWord: string;
		beforeHighlight?: string;
		afterWord?: string;
		description: string;
		stats: AuthStat[];
		badge?: { icon: string; text: string };
		statsBordered?: boolean;
		topPadding?: boolean;
		children?: Snippet;
	}

	let {
		headline,
		highlightedWord,
		beforeHighlight,
		afterWord,
		description,
		stats,
		badge,
		statsBordered = false,
		topPadding = false,
		children
	}: Props = $props();
</script>

<div class="hidden flex-col gap-8 lg:flex {topPadding ? 'pt-2' : ''}">
	<div class="flex flex-col gap-4">
		{#if badge}
			<div
				class="inline-flex w-fit items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5"
			>
				<i class="{badge.icon} text-xs text-brand-green"></i>
				<span class="text-xs font-semibold text-brand-green">{badge.text}</span>
			</div>
		{/if}
		<h1 class="text-4xl leading-tight font-black text-white">
			{headline}<br />{#if beforeHighlight}{beforeHighlight}{/if}<span class="text-brand-green"
				>{highlightedWord}</span
			>{#if afterWord}
				{afterWord}{/if}
		</h1>
		<p class="max-w-md text-base leading-relaxed text-text-muted">{description}</p>
	</div>

	{#if children}
		{@render children()}
	{/if}

	<AuthStatsRow {stats} bordered={statsBordered} />
</div>

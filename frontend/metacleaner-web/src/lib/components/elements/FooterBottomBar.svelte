<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	interface Link {
		href: string;
		label: string;
	}

	interface Props {
		copyright: string;
		links?: Link[];
		madeWith?: boolean;
		pt?: string;
		showBorder?: boolean;
	}

	const {
		copyright,
		links = [],
		madeWith = false,
		pt = 'pt-8',
		showBorder = true
	}: Props = $props();
</script>

<div
	class="{showBorder
		? 'border-t border-border'
		: ''} {pt} flex flex-col sm:flex-row items-center justify-between gap-4"
>
	<p class="text-xs text-text-muted">{copyright}</p>
	{#if madeWith}
		<div class="flex items-center gap-2">
			<span class="text-xs text-text-muted">{m.footer_made_with_1()}</span>
			<i class="fa-solid fa-heart text-brand-red text-xs"></i>
			<span class="text-xs text-text-muted">{m.footer_made_with_2()}</span>
		</div>
	{:else if links.length > 0}
		<div class="flex items-center gap-6">
			{#each links as link, i (i)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={link.href} class="text-xs text-text-muted hover:text-white transition-colors"
					>{link.label}</a
				>
			{/each}
		</div>
	{/if}
</div>

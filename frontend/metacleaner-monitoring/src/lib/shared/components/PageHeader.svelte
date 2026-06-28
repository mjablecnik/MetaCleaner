<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Snippet } from 'svelte';

	interface Props {
		titleKey: string;
		subtitleKey?: string;
		titleMobileKey?: string;
		subtitleMobileKey?: string;
		icon?: string;
		iconContainerClass?: string;
		iconClass?: string;
		statusBadge?: Snippet;
		actions?: Snippet;
	}

	let {
		titleKey,
		subtitleKey,
		titleMobileKey,
		subtitleMobileKey,
		icon,
		iconContainerClass = 'bg-primary/15 border border-primary/30',
		iconClass = 'text-primary text-sm',
		statusBadge,
		actions
	}: Props = $props();

	const mobileTitle = $derived(titleMobileKey ?? titleKey);
	const mobileSubtitle = $derived(subtitleMobileKey ?? subtitleKey);
</script>

<!-- Desktop sticky header -->
<header
	class="hidden lg:flex sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-surface px-6 py-4 items-center justify-between gap-4"
>
	<div class="flex items-center {icon ? 'gap-4' : ''}">
		{#if icon}
			<div
				class="w-9 h-9 rounded-lg {iconContainerClass} flex items-center justify-center flex-shrink-0"
			>
				<i class="fa-solid {icon} {iconClass}"></i>
			</div>
		{/if}
		<div>
			<h1 class="text-2xl font-bold text-textMain">{t(titleKey)}</h1>
			{#if subtitleKey}
				<p class="text-sm text-textSec mt-0.5">{t(subtitleKey)}</p>
			{/if}
		</div>
	</div>
	<div class="flex items-center gap-3 flex-wrap">
		{#if statusBadge}{@render statusBadge()}{/if}
		{#if actions}{@render actions()}{/if}
	</div>
</header>

<!-- Mobile title area -->
<div class="lg:hidden p-4 space-y-3">
	<div>
		<h1 class="text-2xl font-bold text-textMain">{t(mobileTitle)}</h1>
		{#if mobileSubtitle}
			<p class="text-sm text-textSec mt-1">{t(mobileSubtitle)}</p>
		{/if}
	</div>
	{#if statusBadge}
		{@render statusBadge()}
	{/if}
</div>

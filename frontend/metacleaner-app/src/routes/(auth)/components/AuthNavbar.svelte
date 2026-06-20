<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		rightText?: string;
		rightHref?: Pathname;
		rightLabel?: string;
	}

	let { rightText, rightHref, rightLabel }: Props = $props();
</script>

<nav
	class="mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 py-4 lg:py-6"
>
	<div class="flex items-center gap-2.5 lg:gap-3">
		<div
			class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10"
		>
			<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
		</div>
		<span class="text-lg font-bold tracking-tight lg:text-xl">{tx('common.brandName')}</span>
	</div>

	{#if rightHref && rightLabel}
		<div class="flex items-center gap-2">
			{#if rightText}
				<span class="hidden text-xs text-text-muted lg:inline lg:text-sm">{rightText}</span>
			{/if}
			<a
				href={resolve(rightHref!)}
				class="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-lighter lg:px-4 lg:py-2"
			>
				{rightLabel}
			</a>
		</div>
	{/if}
</nav>

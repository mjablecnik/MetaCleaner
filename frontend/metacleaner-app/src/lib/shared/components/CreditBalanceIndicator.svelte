<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { creditLabel } from '$lib/shared/utils/creditPlural';
	import { formatCreditCount, getCreditColorScheme } from '$lib/shared/utils/formatCredits';

	interface Props {
		credits: number | null;
		isLoading: boolean;
		hasError: boolean;
		compact?: boolean;
	}

	const { credits, isLoading, hasError, compact = false }: Props = $props();

	const colorScheme = $derived(credits !== null ? getCreditColorScheme(credits) : 'success');
	const isWarning = $derived(colorScheme === 'warning');

	const dotClass = $derived(
		isWarning
			? 'bg-orange-400 shadow-orange-400/30'
			: 'bg-brand-green shadow-brand-green/30'
	);
	const borderClass = $derived(
		isWarning ? 'border-orange-500/40' : 'border-brand-green/30'
	);
	const bgClass = $derived(
		isWarning ? 'bg-orange-950/40' : 'bg-brand-green/[0.08]'
	);
	const textClass = $derived(isWarning ? 'text-orange-400' : 'text-brand-green');

	const label = $derived(
		credits !== null
			? creditLabel(credits, locale.current as 'en' | 'cs')
			: tx('credits.indicator.credits')
	);
</script>

{#if hasError && credits === null}
	<!-- Hide entirely on error with no cached data -->
{:else if isLoading && credits === null}
	<!-- Skeleton placeholder -->
	<div
		class="h-7 w-20 animate-pulse rounded-full border border-gray-700 bg-navy-lighter {compact
			? 'w-14'
			: 'w-20'}"
	></div>
{:else if credits !== null}
	<div
		class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 {borderClass} {bgClass}"
	>
		<span class="relative flex h-1.5 w-1.5 flex-shrink-0">
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 {dotClass}"
				style="animation-duration: 2s"
			></span>
			<span class="relative inline-flex h-1.5 w-1.5 rounded-full {dotClass}"></span>
		</span>
		<i class="fa-solid fa-bolt text-[9px] {textClass}"></i>
		<span class="text-xs font-bold {textClass}">{formatCreditCount(credits)}</span>
		{#if !compact}
			<span class="text-[10px] font-medium {textClass}">{label}</span>
		{/if}
		{#if hasError}
			<i class="fa-solid fa-exclamation-triangle text-[9px] text-orange-400" title="Stale data"></i>
		{/if}
	</div>
{/if}

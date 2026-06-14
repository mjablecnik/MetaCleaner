<script lang="ts">
	type Variant = 'highlighted' | 'default';

	interface Props {
		icon: string;
		iconColorClass: string;
		bgClass: string;
		title: string;
		description: string;
		badge?: string;
		badgeBgClass?: string;
		href?: string;
		variant?: Variant;
	}

	const {
		icon,
		iconColorClass,
		bgClass,
		title,
		description,
		badge,
		badgeBgClass = '',
		href,
		variant = 'default'
	}: Props = $props();

	const borderClass: Record<Variant, string> = {
		highlighted: 'border-brand-green/20',
		default: 'border-gray-800'
	};

	const sharedClass = $derived(`step-row flex cursor-pointer items-center gap-4 rounded-xl border ${borderClass[variant]} bg-navy-card lg:bg-navy-main p-4 active:scale-[0.98]`);
</script>

{#if href}
	<a {href} class={sharedClass}>
		<div
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl lg:h-9 lg:w-9 lg:rounded-lg {bgClass}"
		>
			<i class="{icon} text-base lg:text-sm {iconColorClass}"></i>
		</div>
		<div class="min-w-0 flex-1">
			<p class="text-sm font-semibold text-white">{title}</p>
			<p class="mt-0.5 text-xs text-text-muted">{description}</p>
		</div>
		<i class="fa-solid fa-chevron-right flex-shrink-0 text-xs text-text-muted"></i>
	</a>
{:else}
	<button class={sharedClass}>
		<div
			class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl lg:h-9 lg:w-9 lg:rounded-lg {bgClass}"
		>
			<i class="{icon} text-base lg:text-sm {iconColorClass}"></i>
		</div>
		<div class="min-w-0 flex-1 text-left">
			<p class="text-sm font-semibold text-white">{title}</p>
			<p class="mt-0.5 text-xs text-text-muted">{description}</p>
		</div>
		{#if badge}
			<span
				class="flex-shrink-0 rounded {badgeBgClass} px-2 py-0.5 text-[10px] font-bold uppercase {iconColorClass}"
				>{badge}</span
			>
		{/if}
	</button>
{/if}

<style>
	.step-row {
		transition: border-color 0.2s ease;
	}
	.step-row:hover {
		border-color: var(--color-brand-green-30);
	}
</style>

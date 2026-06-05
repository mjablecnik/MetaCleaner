<script lang="ts">
	import IconContainer from '$lib/shared/elements/IconContainer.svelte';

	type Color = 'blue' | 'green' | 'red' | 'orange';

	interface Props {
		icon: string;
		iconColor?: Color;
		value: string | number;
		label: string;
		labelMobile?: string;
		highlight?: boolean;
		class?: string;
	}

	const {
		icon,
		iconColor = 'blue',
		value,
		label,
		labelMobile,
		highlight = false,
		class: extraClass = ''
	}: Props = $props();

	const borderColorMap: Record<Color, string> = {
		blue: 'border-brand-blue/20',
		green: 'border-brand-green/20',
		red: 'border-brand-red/20',
		orange: 'border-brand-orange/20'
	};

	const valueColorMap: Record<Color, string> = {
		blue: 'text-brand-blue',
		green: 'text-brand-green',
		red: 'text-brand-red',
		orange: 'text-brand-orange'
	};

	const borderClass = $derived(highlight ? borderColorMap[iconColor] : 'border-gray-800');
	const valueClass = $derived(highlight ? valueColorMap[iconColor] : 'text-white');

	const classes = $derived(
		[
			'bg-navy-card rounded-2xl border shadow-card',
			'p-4 lg:p-5',
			'flex flex-col gap-1',
			borderClass,
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<div class={classes}>
	<IconContainer {icon} color={iconColor} size="md" shape="square" class="mb-1.5 lg:mb-2" />
	<p class="text-xl font-black lg:text-2xl {valueClass}">{value}</p>
	{#if labelMobile}
		<p class="text-[11px] leading-tight text-text-muted lg:text-xs">
			<span class="hidden lg:inline">{label}</span>
			<span class="lg:hidden">{labelMobile}</span>
		</p>
	{:else}
		<p class="text-[11px] leading-tight text-text-muted lg:text-xs">{label}</p>
	{/if}
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Color = 'blue' | 'green' | 'red' | 'orange' | 'muted';
	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	type Shape = 'square' | 'circle';
	type Variant = 'tinted' | 'solid';

	interface Props {
		color?: Color;
		size?: Size;
		shape?: Shape;
		variant?: Variant;
		icon?: string;
		class?: string;
		children?: Snippet;
	}

	const {
		color = 'blue',
		size = 'lg',
		shape = 'square',
		variant = 'tinted',
		icon,
		class: extraClass = '',
		children,
	}: Props = $props();

	const sizeMap: Record<Size, string> = {
		xs: 'w-6 h-6 text-xs',
		sm: 'w-7 h-7 text-xs',
		md: 'w-8 h-8 lg:w-9 lg:h-9 text-sm',
		lg: 'w-9 h-9 lg:w-10 lg:h-10 text-sm lg:text-base',
		xl: 'w-10 h-10 lg:w-12 lg:h-12 text-base lg:text-lg',
		'2xl': 'w-12 h-12 lg:w-14 lg:h-14 text-lg lg:text-xl',
	};

	const shapeMap: Record<Shape, string> = {
		square: 'rounded-xl',
		circle: 'rounded-full',
	};

	const tintedColorMap: Record<Color, string> = {
		blue: 'bg-brand-blue/10 border border-brand-blue/20 text-brand-blue',
		green: 'bg-brand-green/10 border border-brand-green/20 text-brand-green',
		red: 'bg-brand-red/10 border border-brand-red/20 text-brand-red',
		orange: 'bg-brand-orange/10 border border-brand-orange/20 text-brand-orange',
		muted: 'bg-navy-lighter border border-gray-700 text-white',
	};

	const solidColorMap: Record<Color, string> = {
		blue: 'bg-brand-blue text-white shadow-glow-blue',
		green: 'bg-brand-green text-white shadow-glow-green',
		red: 'bg-brand-red text-white shadow-glow-red',
		orange: 'bg-brand-orange text-white',
		muted: 'bg-navy-lighter border border-gray-700 text-white',
	};

	const classes = $derived(
		[
			'flex items-center justify-center flex-shrink-0',
			sizeMap[size],
			shapeMap[shape],
			variant === 'solid' ? solidColorMap[color] : tintedColorMap[color],
			extraClass,
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<div class={classes}>
	{#if icon}
		<i class={icon}></i>
	{/if}
	{@render children?.()}
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		fullWidth?: boolean;
		href?: Pathname;
		type?: 'button' | 'submit' | 'reset';
		children?: Snippet;
		class?: string;
		onclick?: (e: MouseEvent) => void;
	}

	const {
		variant = 'primary',
		size = 'md',
		disabled = false,
		fullWidth = false,
		href,
		type = 'button',
		children,
		class: extraClass = '',
		onclick
	}: Props = $props();

	const sizeMap: Record<Size, string> = {
		sm: 'px-3 py-2 text-xs rounded-lg',
		md: 'px-4 py-3 text-sm rounded-xl',
		lg: 'px-5 py-3.5 text-sm rounded-xl'
	};

	const variantMap: Record<Variant, string> = {
		primary: 'bg-brand-green text-white font-bold hover:bg-green-500 shadow-glow-green',
		secondary: 'bg-navy-lighter border border-gray-700 text-white font-semibold hover:bg-gray-800',
		danger:
			'bg-brand-red/10 border border-brand-red/30 text-brand-red font-semibold hover:bg-brand-red/20',
		ghost: 'text-text-muted font-semibold hover:text-white'
	};

	const classes = $derived(
		[
			'inline-flex items-center justify-center gap-2 transition-all active:scale-95',
			sizeMap[size],
			variantMap[variant],
			disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
			fullWidth && 'w-full',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href && !disabled}
	<a href={resolve(href)} class={classes}>
		{@render children?.()}
	</a>
{:else}
	<button {type} {disabled} {onclick} class={classes}>
		{@render children?.()}
	</button>
{/if}

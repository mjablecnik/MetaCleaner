<script lang="ts">
	import type { Snippet } from 'svelte';

	type BorderColor = 'default' | 'red' | 'blue' | 'green' | 'orange';

	interface Props {
		borderColor?: BorderColor;
		padding?: string;
		class?: string;
		children?: Snippet;
	}

	const {
		borderColor = 'default',
		padding = 'p-4 lg:p-6',
		class: extraClass = '',
		children
	}: Props = $props();

	const borderMap: Record<BorderColor, string> = {
		default: 'border-gray-800',
		red: 'border-brand-red/30',
		blue: 'border-brand-blue/30',
		green: 'border-brand-green/30',
		orange: 'border-brand-orange/30'
	};

	const classes = $derived(
		['bg-navy-card rounded-2xl border shadow-card', borderMap[borderColor], padding, extraClass]
			.filter(Boolean)
			.join(' ')
	);
</script>

<div class={classes}>
	{@render children?.()}
</div>

<script lang="ts">
	type Color = 'blue' | 'green' | 'red' | 'orange' | 'gray';

	interface Props {
		color?: Color;
		label: string;
		icon?: string;
		dot?: boolean;
		class?: string;
	}

	const { color = 'blue', label, icon, dot = false, class: extraClass = '' }: Props = $props();

	const colorMap: Record<Color, { text: string; bg: string; border: string; dot: string }> = {
		blue: {
			text: 'text-brand-blue',
			bg: 'bg-brand-blue/10',
			border: 'border-brand-blue/20',
			dot: 'bg-brand-blue'
		},
		green: {
			text: 'text-brand-green',
			bg: 'bg-brand-green/10',
			border: 'border-brand-green/20',
			dot: 'bg-brand-green'
		},
		red: {
			text: 'text-brand-red',
			bg: 'bg-brand-red/10',
			border: 'border-brand-red/20',
			dot: 'bg-brand-red'
		},
		orange: {
			text: 'text-brand-orange',
			bg: 'bg-brand-orange/10',
			border: 'border-brand-orange/20',
			dot: 'bg-brand-orange'
		},
		gray: {
			text: 'text-text-muted',
			bg: 'bg-gray-700/30',
			border: 'border-gray-600/40',
			dot: 'bg-gray-500'
		}
	};

	const c = $derived(colorMap[color]);

	const classes = $derived(
		[
			'inline-flex items-center gap-1.5',
			'font-bold text-[10px] lg:text-xs',
			'px-2.5 lg:px-3 py-1',
			'rounded-full border',
			'uppercase tracking-wider',
			c.text,
			c.bg,
			c.border,
			extraClass
		].join(' ')
	);
</script>

<span class={classes}>
	{#if dot}
		<span class="h-1.5 w-1.5 rounded-full {c.dot} inline-block flex-shrink-0 animate-pulse"></span>
	{/if}
	{#if icon}
		<i class="{icon} text-[9px]"></i>
	{/if}
	{label}
</span>

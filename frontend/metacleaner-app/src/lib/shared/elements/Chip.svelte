<script lang="ts">
	type Color = 'blue' | 'green' | 'red' | 'orange' | 'muted';
	type Shape = 'rounded' | 'rounded-full';

	interface Props {
		label: string;
		color?: Color;
		border?: boolean;
		shape?: Shape;
		class?: string;
	}

	const {
		label,
		color = 'muted',
		border = true,
		shape = 'rounded-full',
		class: extraClass = ''
	}: Props = $props();

	const colorMap: Record<Color, { text: string; bg: string; border: string }> = {
		blue: {
			text: 'text-brand-blue',
			bg: 'bg-brand-blue/10',
			border: 'border-brand-blue/20'
		},
		green: {
			text: 'text-brand-green',
			bg: 'bg-brand-green/10',
			border: 'border-brand-green/20'
		},
		red: {
			text: 'text-brand-red',
			bg: 'bg-brand-red/10',
			border: 'border-brand-red/20'
		},
		orange: {
			text: 'text-brand-orange',
			bg: 'bg-brand-orange/10',
			border: 'border-brand-orange/20'
		},
		muted: {
			text: 'text-text-muted',
			bg: 'bg-navy-lighter',
			border: 'border-gray-700'
		}
	};

	const c = $derived(colorMap[color]);

	const classes = $derived(
		[
			'inline-flex items-center',
			'text-[10px] font-semibold',
			'px-2 py-0.5',
			shape,
			border && 'border',
			c.text,
			c.bg,
			border && c.border,
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<span class={classes}>{label}</span>

<script lang="ts">
	interface Props {
		eyebrow?: string;
		eyebrowColor?: string;
		title: string;
		subtitle?: string;
		size?: 'lg' | 'sm';
	}

	const { eyebrow, eyebrowColor = 'brand-green', title, subtitle, size = 'lg' }: Props = $props();

	const sizeMap = {
		lg: {
			container: 'mb-12',
			heading: 'text-4xl font-bold mb-4',
			subtitle: 'text-text-muted max-w-xl mx-auto'
		},
		sm: {
			container: 'mb-6',
			heading: 'text-2xl font-bold mb-2',
			subtitle: 'text-sm text-text-muted'
		}
	} as const;

	const eyebrowColorMap: Record<string, string> = {
		'brand-green': 'text-brand-green',
		'brand-blue': 'text-brand-blue',
		'brand-orange': 'text-brand-orange',
		'brand-red': 'text-brand-red'
	};

	const s = $derived(sizeMap[size]);
	const eyebrowClass = $derived(eyebrowColorMap[eyebrowColor] ?? 'text-brand-green');
</script>

<div class="text-center {s.container}">
	{#if eyebrow}
		<span class="text-xs font-bold uppercase tracking-widest {eyebrowClass} mb-3 block"
			>{eyebrow}</span
		>
	{/if}
	<h2 class={s.heading}>{title}</h2>
	{#if subtitle}
		<p class={s.subtitle}>{subtitle}</p>
	{/if}
</div>

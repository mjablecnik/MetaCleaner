<script lang="ts">
	interface Props {
		eyebrow?: string;
		eyebrowColor?: string;
		title: string;
		subtitle?: string;
	}

	const { eyebrow, eyebrowColor = 'brand-green', title, subtitle }: Props = $props();

	const eyebrowColorMap: Record<string, string> = {
		'brand-green': 'text-brand-green',
		'brand-blue': 'text-brand-blue',
		'brand-orange': 'text-brand-orange',
		'brand-red': 'text-brand-red'
	};

	const eyebrowClass = $derived(eyebrowColorMap[eyebrowColor] ?? 'text-brand-green');
</script>

<div class="text-center mb-6 md:mb-12">
	{#if eyebrow}
		<span class="text-xs font-bold uppercase tracking-widest {eyebrowClass} mb-3 block"
			>{eyebrow}</span
		>
	{/if}
	<h2 class="text-2xl md:text-4xl font-bold mb-4">{title}</h2>
	{#if subtitle}
		<p class="text-text-muted max-w-xl mx-auto">{subtitle}</p>
	{/if}
</div>

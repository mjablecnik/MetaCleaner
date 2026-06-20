<script lang="ts">
	interface Props {
		icon: string;
		title: string;
		description: string;
		hoverColor: 'brand-blue' | 'brand-green' | 'brand-orange';
	}

	const { icon, title, description, hoverColor }: Props = $props();

	const borderClass = $derived({
		'brand-blue': 'hover:border-brand-blue/50',
		'brand-green': 'hover:border-brand-green/50',
		'brand-orange': 'hover:border-brand-orange/50',
	}[hoverColor]);

	const iconClass = $derived({
		'brand-blue': 'text-brand-blue bg-brand-blue/10',
		'brand-green': 'text-brand-green bg-brand-green/10',
		'brand-orange': 'text-brand-orange bg-brand-orange/10',
	}[hoverColor]);
</script>

<div
	class="flex flex-col gap-4 p-6 rounded-xl bg-navy-card border border-border transition-colors duration-200 {borderClass}"
>
	<div class="w-10 h-10 rounded-lg flex items-center justify-center {iconClass}">
		<i class="{icon} text-sm"></i>
	</div>

	<div class="flex flex-col gap-2">
		<h3 class="text-base font-semibold">{title}</h3>
		<p class="text-sm text-text-muted leading-relaxed">{description}</p>
	</div>
</div>

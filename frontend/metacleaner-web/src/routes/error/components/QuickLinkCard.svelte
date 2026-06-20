<script lang="ts">
	interface Props {
		href: string;
		icon: string;
		label: string;
		hoverColor: 'brand-blue' | 'brand-green' | 'brand-orange';
	}

	const { href, icon, label, hoverColor }: Props = $props();

	const borderClass = {
		'brand-blue': 'hover:border-brand-blue/50',
		'brand-green': 'hover:border-brand-green/50',
		'brand-orange': 'hover:border-brand-orange/50',
	}[hoverColor];

	const iconClass = {
		'brand-blue': 'text-brand-blue bg-brand-blue/10',
		'brand-green': 'text-brand-green bg-brand-green/10',
		'brand-orange': 'text-brand-orange bg-brand-orange/10',
	}[hoverColor];
</script>

<a
	{href}
	class="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-navy-card border border-border transition-colors duration-200 min-h-[44px] min-w-[44px] {borderClass}"
>
	<div class="w-10 h-10 rounded-lg flex items-center justify-center {iconClass}">
		<i class="{icon} text-sm"></i>
	</div>
	<span class="text-sm font-medium text-white">{label}</span>
</a>

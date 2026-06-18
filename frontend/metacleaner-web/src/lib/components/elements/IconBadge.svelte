<script lang="ts">
	interface Props {
		icon: string;
		color: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		shape?: 'circle' | 'rounded';
		tint?: boolean;
	}

	const { icon, color, size = 'lg', shape = 'rounded', tint = true }: Props = $props();

	const sizeMap = {
		sm: { container: 'w-9 h-9', icon: 'text-sm' },
		md: { container: 'w-10 h-10', icon: 'text-base' },
		lg: { container: 'w-12 h-12', icon: 'text-xl' },
		xl: { container: 'w-14 h-14', icon: 'text-2xl' }
	} as const;

	const shapeMap = {
		circle: 'rounded-full',
		rounded: 'rounded-xl'
	} as const;

	const tintedColorMap: Record<string, { bg: string; text: string }> = {
		'brand-blue': { bg: 'bg-brand-blue/20', text: 'text-brand-blue' },
		'brand-green': { bg: 'bg-brand-green/20', text: 'text-brand-green' },
		'brand-red': { bg: 'bg-brand-red/20', text: 'text-brand-red' },
		'brand-orange': { bg: 'bg-brand-orange/20', text: 'text-brand-orange' }
	};

	const solidColorMap: Record<string, { bg: string; text: string; shadow: string }> = {
		'brand-blue': { bg: 'bg-brand-blue', text: 'text-white', shadow: 'shadow-glow-blue' },
		'brand-green': { bg: 'bg-brand-green', text: 'text-white', shadow: 'shadow-glow-green' },
		'brand-red': { bg: 'bg-brand-red', text: 'text-white', shadow: '' },
		'brand-orange': { bg: 'bg-brand-orange', text: 'text-white', shadow: '' }
	};

	const s = $derived(sizeMap[size] ?? sizeMap.lg);
	const r = $derived(shapeMap[shape]);
	const c = $derived(
		tint
			? (tintedColorMap[color] ?? tintedColorMap['brand-blue'])
			: (solidColorMap[color] ?? solidColorMap['brand-blue'])
	);
	const shadow = $derived(tint ? '' : ((solidColorMap[color] ?? solidColorMap['brand-blue']).shadow));
</script>

<div class="{s.container} {r} {c.bg} flex items-center justify-center {c.text} {s.icon} {shadow}">
	<i class="fa-solid {icon}"></i>
</div>

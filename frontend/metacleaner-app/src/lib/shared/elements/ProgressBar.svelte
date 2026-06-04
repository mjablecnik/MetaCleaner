<script lang="ts">
	type Color = 'blue' | 'green' | 'red' | 'orange' | 'gray';
	type Height = 'xs' | 'sm' | 'md';

	interface Props {
		value: number;
		color?: Color;
		height?: Height;
		class?: string;
	}

	const { value, color = 'blue', height = 'sm', class: extraClass = '' }: Props = $props();

	const heightMap: Record<Height, string> = {
		xs: 'h-1.5',
		sm: 'h-2',
		md: 'h-2.5',
	};

	const fillMap: Record<Color, string> = {
		blue: 'bg-gradient-to-r from-brand-blue to-brand-green',
		green: 'bg-brand-green',
		red: 'bg-gradient-to-r from-brand-red to-red-400',
		orange: 'bg-gradient-to-r from-brand-orange to-yellow-400',
		gray: 'bg-gray-500',
	};

	const clampedValue = $derived(Math.min(100, Math.max(0, value)));
</script>

<div
	class="w-full bg-navy-lighter rounded-full overflow-hidden {heightMap[height]} {extraClass}"
	role="progressbar"
	aria-valuenow={clampedValue}
	aria-valuemin={0}
	aria-valuemax={100}
>
	<div
		class="h-full rounded-full transition-[width] duration-500 ease-out {fillMap[color]}"
		style="width:{clampedValue}%"
	></div>
</div>

<script lang="ts">
	type Color = 'red' | 'orange' | 'green' | 'blue';
	type Size = 'sm' | 'lg';

	interface Props {
		score: number;
		color?: Color;
		size?: Size;
		showLabel?: boolean;
	}

	const { score, color = 'red', size = 'lg', showLabel = false }: Props = $props();

	const clampedScore = $derived(Math.min(100, Math.max(0, score)));
	const dasharray = $derived(`${clampedScore} ${100 - clampedScore}`);

	const strokeVar: Record<Color, string> = {
		red: 'var(--color-brand-red)',
		orange: 'var(--color-brand-orange)',
		green: 'var(--color-brand-green)',
		blue: 'var(--color-brand-blue)'
	};

	const glowFilter: Record<Color, string> = {
		red: 'var(--shadow-drop-red)',
		orange: 'drop-shadow(0 0 6px rgba(249,115,22,0.6))',
		green: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))',
		blue: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))'
	};

	const textColorClass: Record<Color, string> = {
		red: 'text-brand-red',
		orange: 'text-brand-orange',
		green: 'text-brand-green',
		blue: 'text-brand-blue'
	};

	const containerSizeClass: Record<Size, string> = {
		sm: 'w-12 h-12',
		lg: 'w-28 h-28'
	};

	const scoreTextClass: Record<Size, string> = {
		sm: 'text-sm font-black leading-none',
		lg: 'text-3xl font-black leading-none'
	};
</script>

<div class="relative flex flex-shrink-0 items-center justify-center {containerSizeClass[size]}">
	<svg viewBox="0 0 36 36" class="absolute inset-0 h-full w-full -rotate-90">
		<circle
			cx="18"
			cy="18"
			r="15.9"
			fill="none"
			stroke-width="3"
			style="stroke: var(--color-navy-lighter)"
		></circle>
		<circle
			cx="18"
			cy="18"
			r="15.9"
			fill="none"
			stroke-width="3.5"
			stroke-linecap="round"
			stroke-dasharray={dasharray}
			style="stroke: {strokeVar[color]}; filter: {glowFilter[color]}"
		></circle>
	</svg>
	<div class="z-10 text-center">
		<span class="{scoreTextClass[size]} {textColorClass[color]}">{clampedScore}</span>
		{#if showLabel}
			<p class="mt-0.5 text-[9px] tracking-wider text-text-muted uppercase">RISK SCORE</p>
		{/if}
	</div>
</div>

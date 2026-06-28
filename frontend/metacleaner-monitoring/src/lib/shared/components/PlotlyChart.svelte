<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		id: string;
		data: unknown[];
		layout: Record<string, unknown>;
		mobileLayout?: Record<string, unknown>;
		height?: string;
		class?: string;
	}

	let { id, data, layout, mobileLayout, height, class: extraClass = '' }: Props = $props();

	onMount(() => {
		const Plotly = window.Plotly;
		if (!Plotly) return;

		const isMobile = window.matchMedia('(max-width: 1023px)').matches;
		const activeLayout = isMobile && mobileLayout ? { ...layout, ...mobileLayout } : layout;

		const config = {
			responsive: true,
			displayModeBar: false,
			displaylogo: false
		};

		Plotly.newPlot(id, data, activeLayout, config);

		const handleResize = () => {
			const el = document.getElementById(id);
			if (el) Plotly.Plots.resize(el);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div {id} class="w-full {extraClass}" style={height ? `height:${height}` : undefined}></div>

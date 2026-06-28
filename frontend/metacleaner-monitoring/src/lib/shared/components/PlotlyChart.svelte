<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		id: string;
		data: any[];
		layout: any;
		mobileLayout?: any;
		height?: string;
		class?: string;
	}

	let {
		id,
		data,
		layout,
		mobileLayout,
		height = '250px',
		class: extraClass = ''
	}: Props = $props();

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const isMobile = window.matchMedia('(max-width: 1023px)').matches;
		const activeLayout =
			isMobile && mobileLayout ? { ...layout, ...mobileLayout } : layout;

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

<div {id} class="w-full {extraClass}" style="height:{height}"></div>

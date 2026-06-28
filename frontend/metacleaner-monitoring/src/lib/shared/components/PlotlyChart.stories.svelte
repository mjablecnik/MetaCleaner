<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PlotlyChart from './PlotlyChart.svelte';
	import { chartColors } from '$lib/theme/chartColors';

	const commonLayout = {
		margin: { t: 10, r: 10, b: 30, l: 40 },
		plot_bgcolor: 'transparent',
		paper_bgcolor: 'transparent',
		font: { color: chartColors.textSec, family: 'Inter, sans-serif' },
		xaxis: {
			showgrid: true,
			gridcolor: chartColors.surface,
			zeroline: false,
			tickfont: { size: 10 }
		},
		yaxis: {
			showgrid: true,
			gridcolor: chartColors.surface,
			zeroline: false,
			tickfont: { size: 10 }
		},
		showlegend: false,
		autosize: true
	};

	const xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

	const lineData = [
		{
			x: xLabels,
			y: [220, 310, 280, 390, 340, 420],
			type: 'scatter',
			mode: 'lines',
			line: { color: chartColors.primary, width: 2, shape: 'spline' },
			fill: 'tozeroy',
			fillcolor: 'rgba(34,197,94,0.1)'
		}
	];

	const barData = [
		{
			x: xLabels,
			y: [5, 12, 3, 8, 2, 14],
			type: 'bar',
			marker: { color: chartColors.error, cornerradius: 2 }
		}
	];

	const pieData = [
		{
			values: [48, 30, 15, 7],
			labels: ['5xx', 'JS', 'Timeout', 'Other'],
			type: 'pie',
			hole: 0.55,
			marker: {
				colors: [chartColors.error, chartColors.secondary, chartColors.purple, chartColors.blue]
			},
			textinfo: 'none'
		}
	];

	const pieLayout = {
		...commonLayout,
		showlegend: true,
		legend: {
			font: { color: chartColors.textSec, size: 11 },
			bgcolor: 'transparent'
		}
	};

	const { Story } = defineMeta({
		title: 'Components/PlotlyChart',
		component: PlotlyChart,
		tags: ['autodocs']
	});
</script>

<Story name="LineChart">
	<PlotlyChart id="story-line-chart" data={lineData} layout={commonLayout} height="240px" />
</Story>

<Story name="BarChart">
	<PlotlyChart id="story-bar-chart" data={barData} layout={commonLayout} height="240px" />
</Story>

<Story name="PieChart">
	<PlotlyChart id="story-pie-chart" data={pieData} layout={pieLayout} height="240px" />
</Story>

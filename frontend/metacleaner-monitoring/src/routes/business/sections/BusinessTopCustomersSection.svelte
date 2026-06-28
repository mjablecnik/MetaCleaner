<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getGeoRevenue } from '$lib/repositories/businessRepository';
	import TopCustomerRow from '../components/TopCustomerRow.svelte';

	const geoRevenue = getGeoRevenue();

	const topCustomers = [
		{ name: 'Acme Corp', plan: 'Enterprise', mrr: '$2,800', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
		{ name: 'TechVision', plan: 'Enterprise', mrr: '$1,960', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg' },
		{ name: 'DataFlow GmbH', plan: 'Business', mrr: '$1,200', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' },
		{ name: 'Nexo Solutions', plan: 'Business', mrr: '$960', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg' },
		{ name: 'Sparkly Media', plan: 'Pro', mrr: '$750', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' }
	];

	onMount(() => {
		const P = (window as any).Plotly;
		if (!P) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const blueColor = chartColors.blue;
		const greenColor = chartColors.greenMuted;
		const purpleColor = chartColors.purple;
		const secondaryColor = chartColors.secondary;
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const pieLayout: any = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false
		};

		// Geo pie
		const dataGeo = [{ type: 'pie', labels: ['Evropa','Sev. Amerika','Asie','Ostatní'], values: [23194,15462,6282,3382], hole: 0.55, marker: { colors: [blueColor, greenColor, purpleColor, secondaryColor], line: { color: bgCard, width: 2 } }, textinfo: 'none', hovertemplate: '<b>%{label}</b><br>$%{value}<extra></extra>' }];
		const geoPieLayout = { ...pieLayout, annotations: [{ text: `<b style="font-size:14px;color:${chartColors.textMain}">48%</b><br><span style="font-size:9px;color:${chartColors.textSec}">MRR celkem</span>`, x: 0.5, y: 0.5, xanchor: 'center', yanchor: 'middle', showarrow: false }] };

		try { const el = document.getElementById('chart-geo'); if (el) P.newPlot('chart-geo', dataGeo, geoPieLayout, chartConfig); } catch(e) {}
		try { const el = document.getElementById('chart-geo-m'); if (el) P.newPlot('chart-geo-m', dataGeo, geoPieLayout, chartConfig); } catch(e) {}

		const handleResize = () => {
			['chart-geo', 'chart-geo-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) P.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP TOP CUSTOMERS ===== -->
<section class="hidden lg:grid grid-cols-3 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5 col-span-2">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('business_topCustomers_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_topCustomers_subtitle')}</p>
			</div>
		</div>
		<div class="space-y-3">
			{#each topCustomers as customer}
				<TopCustomerRow name={customer.name} plan={customer.plan} mrr={customer.mrr} avatar={customer.avatar} />
			{/each}
		</div>
	</div>
	<div class="bg-card border border-surface rounded-xl p-5 col-span-1">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('business_revenueByRegion_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('business_revenueByRegion_subtitle')}</p>
			</div>
		</div>
		<div id="chart-geo" class="h-[180px] w-full"></div>
		<div class="mt-3 space-y-2">
			{#each geoRevenue as geo}
				<div class="flex items-center justify-between text-xs">
					<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:{geo.color}"></span><span class="text-textSec">{t(geo.labelKey)}</span></div>
					<span class="text-textMain font-medium">{geo.percent} · ${geo.value.toLocaleString()}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ===== MOBILE TOP CUSTOMERS ===== -->
<div class="lg:hidden space-y-4">
	<!-- Top zákazníci -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-3">{t('business_topCustomers_title')}</h3>
		<div class="space-y-2.5">
			{#each topCustomers as customer}
				<div class="flex items-center gap-3">
					<img src={customer.avatar} alt={customer.name} class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<p class="text-textMain text-xs font-semibold">{customer.name}</p>
						<p class="text-xs text-textSec">{customer.plan}</p>
					</div>
					<span class="text-textMain text-xs font-bold">{customer.mrr}<span class="text-textSec font-normal">/mo</span></span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Příjem dle regionu -->
	<section class="bg-card border border-surface rounded-xl p-4">
		<h3 class="text-sm font-semibold text-textMain mb-0.5">{t('business_revenueByRegion_title')}</h3>
		<p class="text-xs text-textSec mb-3">{t('business_revenueByRegion_subtitle')}</p>
		<div id="chart-geo-m" class="h-[180px] w-full"></div>
		<div class="mt-3 space-y-1.5">
			{#each geoRevenue as geo}
				<div class="flex items-center justify-between text-xs">
					<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full inline-block" style="background:{geo.color}"></span><span class="text-textSec">{t(geo.labelKey)}</span></div>
					<span class="text-textMain font-medium">{geo.percent} · ${geo.value.toLocaleString()}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

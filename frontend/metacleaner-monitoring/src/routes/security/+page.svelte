<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	type AccordionKey = 'ips' | 'log';
	type ChartTab = 'threats' | 'geo' | 'attacks';

	let accordionOpen = $state<Record<AccordionKey, boolean>>({
		ips: false,
		log: false
	});
	let activeTab = $state<ChartTab>('threats');

	function toggleAccordion(key: AccordionKey) {
		accordionOpen[key] = !accordionOpen[key];
		if (accordionOpen[key]) {
			setTimeout(() => {
				const Plotly = (window as any).Plotly;
				if (!Plotly) return;
				const elMap: Record<AccordionKey, string> = {
					ips: '',
					log: ''
				};
				const elId = elMap[key];
				if (elId) {
					const el = document.getElementById(elId);
					if (el) Plotly.Plots.resize(el);
				}
			}, 50);
		}
	}

	function switchTab(tab: ChartTab) {
		activeTab = tab;
		setTimeout(() => {
			const Plotly = (window as any).Plotly;
			if (!Plotly) return;
			const elMap: Record<ChartTab, string> = {
				threats: 'chart-threats-m',
				geo: 'chart-geo-m',
				attacks: 'chart-attack-pie-m'
			};
			const el = document.getElementById(elMap[tab]);
			if (el) Plotly.Plots.resize(el);
		}, 50);
	}

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = '#111d33';
		const textSec = '#94a3b8';
		const errorColor = '#ef4444';
		const secondaryColor = '#f97316';
		const purpleColor = '#8b5cf6';
		const blueColor = '#3b82f6';
		const gridColor = 'rgba(30,41,59,0.8)';
		const chartConfig = { responsive: true, displayModeBar: false, displaylogo: false };

		const commonLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 10, r: 10, b: 40, l: 45 },
			showlegend: false,
			xaxis: {
				gridcolor: gridColor,
				linecolor: gridColor,
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false
			},
			yaxis: {
				gridcolor: gridColor,
				linecolor: gridColor,
				tickcolor: 'transparent',
				tickfont: { color: textSec, size: 10 },
				zeroline: false
			}
		};

		const mobileLayout = {
			...commonLayout,
			font: { ...commonLayout.font, size: 10 },
			margin: { t: 8, r: 8, b: 36, l: 38 },
			xaxis: { ...commonLayout.xaxis, tickfont: { color: textSec, size: 9 }, nticks: 6 },
			yaxis: { ...commonLayout.yaxis, tickfont: { color: textSec, size: 9 } }
		};

		const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
		const critical = [1, 0, 0, 1, 2, 3, 4, 6, 3, 2, 1, 1];
		const warnings = [2, 1, 1, 3, 5, 8, 10, 14, 8, 6, 4, 2];
		const logins = [28, 14, 10, 22, 65, 148, 210, 340, 180, 120, 88, 60];

		const dataThreatTimeline = [
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Varování',
				x: hours, y: warnings,
				line: { color: secondaryColor, width: 2, shape: 'spline' },
				fillcolor: 'rgba(249,115,22,0.08)',
				hovertemplate: '<b>%{x}</b><br>Varování: %{y}<extra></extra>'
			},
			{
				type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Kritické',
				x: hours, y: critical,
				line: { color: errorColor, width: 2.5, shape: 'spline' },
				fillcolor: 'rgba(239,68,68,0.12)',
				hovertemplate: '<b>%{x}</b><br>Kritické: %{y}<extra></extra>'
			}
		];

		const dataGeo = [
			{
				type: 'bar', orientation: 'h',
				x: [12, 18, 24, 38, 67],
				y: ['Ostatní', 'Iran', 'Ukraine', 'China', 'Russia'],
				marker: { color: ['rgba(148,163,184,0.6)', 'rgba(139,92,246,0.7)', 'rgba(249,115,22,0.7)', 'rgba(59,130,246,0.7)', 'rgba(239,68,68,0.8)'] },
				hovertemplate: '<b>%{y}</b><br>Hrozby: %{x}<extra></extra>'
			}
		];

		const dataAttackPie = [
			{
				type: 'pie',
				labels: ['Brute Force', 'SQL Injection', 'XSS', 'Rate Abuse'],
				values: [42, 28, 18, 12],
				hole: 0.60,
				marker: {
					colors: [errorColor, purpleColor, secondaryColor, blueColor],
					line: { color: bgCard, width: 2 }
				},
				textinfo: 'none',
				hovertemplate: '<b>%{label}</b><br>%{value}%<extra></extra>',
				direction: 'clockwise'
			}
		];

		const dataLogins = [
			{
				type: 'bar',
				x: hours, y: logins,
				marker: {
					color: logins.map((v: number) => v > 200 ? errorColor : v > 100 ? secondaryColor : 'rgba(239,68,68,0.4)'),
					opacity: 0.85
				},
				hovertemplate: '<b>%{x}</b><br>%{y} pokusů<extra></extra>'
			}
		];

		const pieLayout = {
			paper_bgcolor: bgCard,
			plot_bgcolor: bgCard,
			font: { family: 'Inter, sans-serif', color: textSec, size: 11 },
			margin: { t: 5, r: 5, b: 5, l: 5 },
			showlegend: false,
			annotations: [{
				text: '<b style="font-size:18px;color:#ef4444">42%</b><br><span style="font-size:10px;color:#94a3b8">Brute Force</span>',
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 13, color: '#ffffff' }
			}]
		};

		const mobilePieLayout = {
			...pieLayout,
			annotations: [{
				text: '<b style="font-size:16px;color:#ef4444">42%</b><br><span style="font-size:9px;color:#94a3b8">Brute Force</span>',
				x: 0.5, y: 0.5,
				xanchor: 'center', yanchor: 'middle',
				showarrow: false,
				font: { size: 12, color: '#ffffff' }
			}]
		};

		const geoLayout = {
			...commonLayout,
			margin: { t: 10, r: 20, b: 30, l: 70 },
			xaxis: { ...commonLayout.xaxis, title: { text: 'Počet událostí', font: { size: 10, color: textSec } } }
		};

		const mobileGeoLayout = {
			...mobileLayout,
			margin: { t: 8, r: 16, b: 28, l: 60 }
		};

		// Desktop charts
		const elThreats = document.getElementById('chart-threats');
		if (elThreats) Plotly.newPlot('chart-threats', dataThreatTimeline, commonLayout, chartConfig);

		const elGeo = document.getElementById('chart-geo');
		if (elGeo) Plotly.newPlot('chart-geo', dataGeo, geoLayout, chartConfig);

		const elPie = document.getElementById('chart-attack-pie');
		if (elPie) Plotly.newPlot('chart-attack-pie', dataAttackPie, pieLayout, chartConfig);

		const elLogins = document.getElementById('chart-logins');
		if (elLogins) Plotly.newPlot('chart-logins', dataLogins, { ...commonLayout, bargap: 0.3, yaxis: { ...commonLayout.yaxis, title: { text: 'Pokusy', font: { size: 10, color: textSec } } } }, chartConfig);

		// Mobile charts
		const elThreatsM = document.getElementById('chart-threats-m');
		if (elThreatsM) Plotly.newPlot('chart-threats-m', dataThreatTimeline, mobileLayout, chartConfig);

		const elGeoM = document.getElementById('chart-geo-m');
		if (elGeoM) Plotly.newPlot('chart-geo-m', dataGeo, mobileGeoLayout, chartConfig);

		const elPieM = document.getElementById('chart-attack-pie-m');
		if (elPieM) Plotly.newPlot('chart-attack-pie-m', dataAttackPie, mobilePieLayout, chartConfig);

		const elLoginsM = document.getElementById('chart-logins-m');
		if (elLoginsM) Plotly.newPlot('chart-logins-m', dataLogins, { ...mobileLayout, bargap: 0.3 }, chartConfig);

		const handleResize = () => {
			['chart-threats', 'chart-geo', 'chart-attack-pie', 'chart-logins',
			 'chart-threats-m', 'chart-geo-m', 'chart-attack-pie-m', 'chart-logins-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP LAYOUT ===== -->
<div class="hidden lg:block">
	<header class="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-[#1e293b] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div class="w-9 h-9 rounded-lg bg-error/15 border border-error/30 flex items-center justify-center">
				<i class="fa-solid fa-shield-halved text-error text-sm"></i>
			</div>
			<div>
				<h1 class="text-2xl font-bold text-textMain">Security Signály</h1>
				<p class="text-sm text-textSec mt-0.5">Produkční prostředí • Všechny regiony • Posledních 24 hodin</p>
			</div>
		</div>
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
				<div class="w-2 h-2 rounded-full bg-error animate-pulse"></div>
				3 aktivní hrozby
			</div>
			<select class="bg-[#1e293b] border border-[#334155] text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none">
				<option>Posledních 24 hodin</option>
				<option>Posledních 7 dní</option>
				<option>Posledních 30 dní</option>
			</select>
			<button class="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3748] text-white rounded-lg text-sm font-medium transition-colors border border-[#334155]">
				<i class="fa-solid fa-download mr-2"></i>Export
			</button>
		</div>
	</header>

	<div class="p-6 max-w-7xl mx-auto space-y-6">

		<!-- KPI Stats Row 1 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-error/30 rounded-xl p-5 relative overflow-hidden">
				<div class="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-full -translate-y-8 translate-x-8"></div>
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Threat Score</h3>
					<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">Kritické</span>
				</div>
				<div class="flex items-end gap-2 mb-3">
					<span class="text-3xl font-bold text-error">74</span>
					<span class="text-sm text-textSec mb-1">/ 100</span>
					<span class="text-sm text-error mb-1 flex items-center gap-1 ml-1"><i class="fa-solid fa-arrow-up text-xs"></i>+12</span>
				</div>
				<div class="w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
					<div class="h-full bg-error rounded-full" style="width:74%"></div>
				</div>
				<p class="text-xs text-textSec mt-2">Oproti včerejšku: +12 bodů</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Neúspěšná přihlášení</h3>
					<span class="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">Varování</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-textMain">1,284</span>
					<span class="text-sm text-secondary mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+340</span>
				</div>
				<p class="text-xs text-textSec mt-2">Brute-force detekovány: 4 IP</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Blokované IP adresy</h3>
					<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">Aktivní</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-textMain">38</span>
					<span class="text-sm text-success mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+6</span>
				</div>
				<p class="text-xs text-textSec mt-2">Auto-blok: 28 · Manuálně: 10</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-start mb-3">
					<h3 class="text-textSec text-sm font-medium">Anomálie (24h)</h3>
					<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">Kritické</span>
				</div>
				<div class="flex items-end gap-2">
					<span class="text-3xl font-bold text-error">7</span>
					<span class="text-sm text-error mb-1 flex items-center gap-1"><i class="fa-solid fa-arrow-up text-xs"></i>+3</span>
				</div>
				<p class="text-xs text-textSec mt-2">SQL Injection, XSS, Rate Abuse</p>
			</div>
		</section>

		<!-- KPI Stats Row 2 -->
		<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center">
						<i class="fa-solid fa-eye text-[#3b82f6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">Skenování portů</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">12</div>
				<p class="text-xs text-textSec mt-1">Unikátní útočníci dnes</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center">
						<i class="fa-solid fa-bug text-error text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">SQL Injection pokusy</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">23</div>
				<p class="text-xs text-textSec mt-1">Všechny blokovány · WAF</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center">
						<i class="fa-solid fa-key text-[#8b5cf6] text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">API klíče – podezřelé</h3>
				</div>
				<div class="text-2xl font-bold text-textMain">2</div>
				<p class="text-xs text-textSec mt-1">Revokováno: 1 · Šetření: 1</p>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
						<i class="fa-solid fa-certificate text-success text-xs"></i>
					</div>
					<h3 class="text-textSec text-sm font-medium">SSL Certifikáty</h3>
				</div>
				<div class="text-2xl font-bold text-success">Platné</div>
				<p class="text-xs text-textSec mt-1">Vyprší za: <span class="text-secondary font-medium">18 dní</span></p>
			</div>
		</section>

		<!-- Charts Row -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Bezpečnostní události v čase</h3>
						<p class="text-xs text-textSec mt-0.5">Počet detekovaných hrozeb za hodinu</p>
					</div>
					<div class="flex gap-2">
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error inline-block"></span>Kritické</span>
						<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>Varování</span>
					</div>
				</div>
				<div id="chart-threats" class="h-[220px] w-full"></div>
			</div>
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Geografický původ hrozeb</h3>
						<p class="text-xs text-textSec mt-0.5">Top 5 zdrojových zemí útočníků</p>
					</div>
				</div>
				<div id="chart-geo" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Attack Types + Active Threats -->
		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<h3 class="text-lg font-semibold text-textMain mb-1">Typy útoků</h3>
				<p class="text-xs text-textSec mb-4">Distribuce detekovaných hrozeb</p>
				<div id="chart-attack-pie" class="h-[200px] w-full"></div>
				<div class="mt-4 space-y-2">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-error inline-block"></span><span class="text-textSec">Brute Force</span></div>
						<span class="text-textMain font-medium">42%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] inline-block"></span><span class="text-textSec">SQL Injection</span></div>
						<span class="text-textMain font-medium">28%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span><span class="text-textSec">XSS</span></div>
						<span class="text-textMain font-medium">18%</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block"></span><span class="text-textSec">Rate Abuse</span></div>
						<span class="text-textMain font-medium">12%</span>
					</div>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Aktivní hrozby</h3>
						<p class="text-xs text-textSec mt-0.5">Vyžadují okamžitou pozornost</p>
					</div>
					<span class="text-xs text-textSec bg-badge px-2 py-1 rounded">3 aktivní</span>
				</div>
				<div class="space-y-3">
					<div class="flex items-start gap-4 p-4 rounded-xl bg-error/5 border border-error/20">
						<div class="flex-shrink-0 mt-0.5">
							<div class="w-9 h-9 rounded-lg bg-error/15 flex items-center justify-center">
								<i class="fa-solid fa-user-ninja text-error text-sm"></i>
							</div>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<p class="text-textMain text-sm font-semibold">Brute Force útok – Admin panel</p>
								<span class="px-1.5 py-0.5 bg-error/20 text-error text-xs rounded font-medium">Kritické</span>
							</div>
							<p class="text-xs text-textSec">IP: 185.234.219.14 · Původ: RU · Pokusy: 1,084x za 2h</p>
							<p class="text-xs text-textSec mt-0.5">Endpoint: /api/auth/login · Agent: python-requests/2.28</p>
						</div>
						<div class="flex-shrink-0 flex flex-col gap-2 items-end">
							<div class="text-error font-bold text-xs whitespace-nowrap">14:32 – aktivní</div>
							<button class="px-3 py-1 bg-error text-white text-xs font-medium rounded-lg hover:bg-error/90 transition-colors">Blokovat IP</button>
						</div>
					</div>
					<div class="flex items-start gap-4 p-4 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/20">
						<div class="flex-shrink-0 mt-0.5">
							<div class="w-9 h-9 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center">
								<i class="fa-solid fa-bug text-[#8b5cf6] text-sm"></i>
							</div>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<p class="text-textMain text-sm font-semibold">SQL Injection pokus</p>
								<span class="px-1.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs rounded font-medium">Vysoké</span>
							</div>
							<p class="text-xs text-textSec">IP: 92.118.160.47 · Původ: CN · Payload: <code class="text-[#8b5cf6] bg-[#1e293b] px-1 rounded text-xs">1' OR '1'='1</code></p>
							<p class="text-xs text-textSec mt-0.5">Endpoint: /api/products/search · Zablokováno WAF</p>
						</div>
						<div class="flex-shrink-0 flex flex-col gap-2 items-end">
							<div class="text-[#8b5cf6] font-bold text-xs whitespace-nowrap">13:58 – aktivní</div>
							<button class="px-3 py-1 bg-[#8b5cf6] text-white text-xs font-medium rounded-lg hover:bg-[#7c3aed] transition-colors">Blokovat IP</button>
						</div>
					</div>
					<div class="flex items-start gap-4 p-4 rounded-xl bg-secondary/5 border border-secondary/20">
						<div class="flex-shrink-0 mt-0.5">
							<div class="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center">
								<i class="fa-solid fa-key text-secondary text-sm"></i>
							</div>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<p class="text-textMain text-sm font-semibold">Podezřelý API klíč – neobvyklý region</p>
								<span class="px-1.5 py-0.5 bg-secondary/20 text-secondary text-xs rounded font-medium">Střední</span>
							</div>
							<p class="text-xs text-textSec">API Key: sk_live_***8f2a · Původ: NG · User ID: u_4821</p>
							<p class="text-xs text-textSec mt-0.5">Požadavky: 3,200/h (limit: 500) · Endpoint: /api/export</p>
						</div>
						<div class="flex-shrink-0 flex flex-col gap-2 items-end">
							<div class="text-secondary font-bold text-xs whitespace-nowrap">12:15 – aktivní</div>
							<button class="px-3 py-1 bg-secondary text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors">Revokovat klíč</button>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Blocked IPs + Failed Logins -->
		<section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Blokované IP adresy</h3>
						<p class="text-xs text-textSec mt-0.5">Automaticky + manuálně blokované</p>
					</div>
					<button class="px-3 py-1.5 bg-[#1e293b] hover:bg-[#2d3748] text-textSec hover:text-textMain text-xs rounded-lg border border-[#334155] transition-colors">
						<i class="fa-solid fa-plus mr-1.5"></i>Přidat IP
					</button>
				</div>
				<div class="space-y-2">
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40 hover:border-[#334155] transition-colors">
						<div class="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-ban text-error text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono">185.234.219.14</p>
							<p class="text-xs text-textSec">RU · Brute force · 1,084 pokusů</p>
						</div>
						<div class="flex items-center gap-2 flex-shrink-0">
							<span class="px-1.5 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Auto</span>
							<span class="text-xs text-textSec">dnes 14:32</span>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40 hover:border-[#334155] transition-colors">
						<div class="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-ban text-error text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono">92.118.160.47</p>
							<p class="text-xs text-textSec">CN · SQL Injection · WAF blok</p>
						</div>
						<div class="flex items-center gap-2 flex-shrink-0">
							<span class="px-1.5 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">WAF</span>
							<span class="text-xs text-textSec">dnes 13:58</span>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40 hover:border-[#334155] transition-colors">
						<div class="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-ban text-secondary text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono">45.142.212.100</p>
							<p class="text-xs text-textSec">UA · Rate abuse · 8,200 req/h</p>
						</div>
						<div class="flex items-center gap-2 flex-shrink-0">
							<span class="px-1.5 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Auto</span>
							<span class="text-xs text-textSec">dnes 11:14</span>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40 hover:border-[#334155] transition-colors">
						<div class="w-7 h-7 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-ban text-[#3b82f6] text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono">103.21.244.0/22</p>
							<p class="text-xs text-textSec">IR · Manuální blok · CIDR rozsah</p>
						</div>
						<div class="flex items-center gap-2 flex-shrink-0">
							<span class="px-1.5 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Manual</span>
							<span class="text-xs text-textSec">včera 09:20</span>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40 hover:border-[#334155] transition-colors">
						<div class="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
							<i class="fa-solid fa-ban text-error text-xs"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-textMain text-sm font-mono">194.165.16.75</p>
							<p class="text-xs text-textSec">KZ · Brute force · 521 pokusů</p>
						</div>
						<div class="flex items-center gap-2 flex-shrink-0">
							<span class="px-1.5 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Auto</span>
							<span class="text-xs text-textSec">včera 22:41</span>
						</div>
					</div>
				</div>
				<div class="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-textSec">
					<span>Zobrazeno 5 z 38 blokovaných IP</span>
					<button class="text-[#3b82f6] hover:text-[#60a5fa] transition-colors">Zobrazit vše →</button>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-5">
				<div class="flex justify-between items-center mb-4">
					<div>
						<h3 class="text-lg font-semibold text-textMain">Neúspěšná přihlášení v čase</h3>
						<p class="text-xs text-textSec mt-0.5">Počet pokusů za hodinu</p>
					</div>
				</div>
				<div id="chart-logins" class="h-[220px] w-full"></div>
			</div>
		</section>

		<!-- Security Event Log -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-5">
			<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
				<div>
					<h3 class="text-lg font-semibold text-textMain">Security Event Log</h3>
					<p class="text-xs text-textSec mt-0.5">Posledních 24 hodin · 47 záznamů</p>
				</div>
				<div class="flex gap-3 flex-wrap">
					<div class="flex rounded-lg overflow-hidden border border-[#334155]">
						<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium">Všechny</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Kritické</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Varování</button>
						<button class="px-3 py-1.5 bg-transparent text-textSec text-xs font-medium hover:bg-[#1e293b]">Info</button>
					</div>
					<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
						<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
						<input type="text" placeholder="Hledat..." class="bg-transparent text-sm text-textMain placeholder-textSec outline-none w-32" />
					</div>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[#1e293b]">
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Čas</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Typ</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Popis</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">IP / Zdroj</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3 pr-4">Endpoint</th>
							<th class="text-left text-xs text-textSec font-semibold uppercase tracking-wider pb-3">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-[#1e293b]/60">
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">14:32:11</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Brute Force</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">1,084 neúspěšných přihlášení za 2 hodiny</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">185.234.219.14 · RU</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/auth/login</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">Aktivní</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:58:04</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">SQL Inject.</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Pokus o SQL injection v parametru query</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">92.118.160.47 · CN</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/products/search</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs rounded">Blokováno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">13:21:39</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Rate Abuse</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Překročení rate limitu 8,200 req/h (limit 500)</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">45.142.212.100 · UA</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/export</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">12:15:22</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">API Abuse</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Podezřelý API klíč z neobvyklého regionu (NG)</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">sk_live_***8f2a · NG</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/export</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">Aktivní</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">11:44:08</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">XSS</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">XSS payload detekován v komentáři produktu</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">78.141.212.55 · DE</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/reviews</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Blokováno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">09:30:18</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Port Scan</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">Skenování 240 portů za 30 sekund detekováno</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">91.108.4.200 · NL</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">—</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Blokováno</span></td>
						</tr>
						<tr class="hover:bg-[#1e293b]/30 transition-colors">
							<td class="py-3 pr-4 text-textSec whitespace-nowrap font-mono text-xs">07:12:55</td>
							<td class="py-3 pr-4"><span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Brute Force</span></td>
							<td class="py-3 pr-4 text-textMain max-w-xs truncate">521 neúspěšných přihlášení – různé user ID</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">194.165.16.75 · KZ</td>
							<td class="py-3 pr-4 text-textSec font-mono text-xs">/api/auth/login</td>
							<td class="py-3"><span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Blokováno</span></td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

	</div>
</div>

<!-- ===== MOBILE LAYOUT ===== -->
<div class="lg:hidden pb-20">

	<!-- Page Title Bar -->
	<div class="px-4 pt-3 pb-3 bg-card border-b border-[#1e293b] flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-lg bg-error/15 border border-error/30 flex items-center justify-center">
				<i class="fa-solid fa-shield-halved text-error text-xs"></i>
			</div>
			<div>
				<h1 class="text-base font-bold text-textMain leading-tight">Security Signály</h1>
				<p class="text-xs text-textSec">Produkce · Všechny regiony</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium">
				<div class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
				3 hrozby
			</div>
			<select class="bg-[#1e293b] border border-[#334155] text-xs text-textMain rounded-lg px-2.5 py-2 focus:outline-none min-h-[36px]">
				<option>24 hodin</option>
				<option>7 dní</option>
				<option>30 dní</option>
			</select>
		</div>
	</div>

	<div class="px-4 py-4 space-y-4">

		<!-- KPI Stats (2x2 grid, Threat Score spans full width) -->
		<section class="grid grid-cols-2 gap-3">
			<div class="bg-card border border-error/30 rounded-xl p-4 relative overflow-hidden col-span-2">
				<div class="absolute top-0 right-0 w-20 h-20 bg-error/5 rounded-full -translate-y-6 translate-x-6"></div>
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-textSec text-xs font-medium">Threat Score</h3>
					<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">Kritické</span>
				</div>
				<div class="flex items-center gap-3 mb-3">
					<span class="text-4xl font-bold text-error">74</span>
					<div class="flex flex-col gap-0.5">
						<span class="text-xs text-textSec">/ 100</span>
						<span class="text-xs text-error flex items-center gap-1 font-medium"><i class="fa-solid fa-arrow-up text-xs"></i>+12 dnes</span>
					</div>
					<div class="flex-1 ml-2">
						<div class="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-error/60 to-error rounded-full" style="width:74%"></div>
						</div>
						<p class="text-xs text-textSec mt-1">Oproti včerejšku: +12 bodů</p>
					</div>
				</div>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">Neúspěšná přihlášení</h3>
				<div class="text-2xl font-bold text-textMain">1,284</div>
				<span class="text-xs text-secondary flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>+340</span>
				<p class="text-xs text-textSec mt-1.5 leading-tight">Brute-force: 4 IP</p>
				<span class="mt-2 inline-block px-1.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">Varování</span>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2 leading-tight">Blokované IP</h3>
				<div class="text-2xl font-bold text-textMain">38</div>
				<span class="text-xs text-success flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>+6</span>
				<p class="text-xs text-textSec mt-1.5 leading-tight">Auto: 28 · Manual: 10</p>
				<span class="mt-2 inline-block px-1.5 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">Aktivní</span>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2">Anomálie (24h)</h3>
				<div class="text-2xl font-bold text-error">7</div>
				<span class="text-xs text-error flex items-center gap-0.5 font-medium mt-0.5"><i class="fa-solid fa-arrow-up text-xs"></i>+3</span>
				<p class="text-xs text-textSec mt-1.5 leading-tight">SQL, XSS, Rate</p>
				<span class="mt-2 inline-block px-1.5 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">Kritické</span>
			</div>

			<div class="bg-card border border-[#1e293b] rounded-xl p-4">
				<h3 class="text-textSec text-xs font-medium mb-2">SSL Certifikáty</h3>
				<div class="text-2xl font-bold text-success">Platné</div>
				<p class="text-xs text-textSec mt-1.5">Vyprší za: <span class="text-secondary font-medium">18 dní</span></p>
				<div class="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center mt-2">
					<i class="fa-solid fa-certificate text-success text-xs"></i>
				</div>
			</div>
		</section>

		<!-- Secondary Stats (horizontal scroll) -->
		<section class="overflow-x-auto -mx-4 px-4">
			<div class="flex gap-3 w-max">
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 w-36 flex-shrink-0">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center mb-2">
						<i class="fa-solid fa-eye text-[#3b82f6] text-xs"></i>
					</div>
					<div class="text-xl font-bold text-textMain">12</div>
					<p class="text-xs text-textSec mt-0.5 leading-tight">Skenování portů</p>
				</div>
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 w-36 flex-shrink-0">
					<div class="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center mb-2">
						<i class="fa-solid fa-bug text-error text-xs"></i>
					</div>
					<div class="text-xl font-bold text-textMain">23</div>
					<p class="text-xs text-textSec mt-0.5 leading-tight">SQL Injection</p>
				</div>
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 w-36 flex-shrink-0">
					<div class="w-8 h-8 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center mb-2">
						<i class="fa-solid fa-key text-[#8b5cf6] text-xs"></i>
					</div>
					<div class="text-xl font-bold text-textMain">2</div>
					<p class="text-xs text-textSec mt-0.5 leading-tight">API klíče – podezřelé</p>
				</div>
				<div class="bg-card border border-[#1e293b] rounded-xl p-4 w-36 flex-shrink-0">
					<div class="w-8 h-8 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center mb-2">
						<i class="fa-solid fa-eye text-[#3b82f6] text-xs"></i>
					</div>
					<div class="text-xl font-bold text-textMain">12</div>
					<p class="text-xs text-textSec mt-0.5 leading-tight">Unikátní útočníci</p>
				</div>
			</div>
		</section>

		<!-- Active Threats -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#1e293b]">
				<div>
					<h3 class="text-base font-semibold text-textMain">Aktivní hrozby</h3>
					<p class="text-xs text-textSec mt-0.5">Vyžadují okamžitou pozornost</p>
				</div>
				<span class="flex items-center gap-1.5 text-xs text-error bg-error/10 border border-error/20 px-2.5 py-1 rounded-lg font-medium">
					<div class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
					3 aktivní
				</span>
			</div>
			<div class="divide-y divide-[#1e293b]/60">
				<div class="p-4 bg-error/5">
					<div class="flex items-start gap-3">
						<div class="w-9 h-9 rounded-lg bg-error/15 flex items-center justify-center flex-shrink-0 mt-0.5">
							<i class="fa-solid fa-user-ninja text-error text-sm"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap mb-1">
								<p class="text-textMain text-sm font-semibold leading-tight">Brute Force – Admin panel</p>
								<span class="px-1.5 py-0.5 bg-error/20 text-error text-xs rounded font-medium">Kritické</span>
							</div>
							<p class="text-xs text-textSec">IP: 185.234.219.14 · RU · 1,084 pokusů za 2h</p>
							<p class="text-xs text-textSec mt-0.5 font-mono">/api/auth/login</p>
							<div class="flex items-center justify-between mt-3">
								<span class="text-error font-bold text-xs">14:32 – aktivní</span>
								<button class="px-4 py-2 bg-error text-white text-xs font-medium rounded-lg hover:bg-error/90 transition-colors min-h-[36px]">Blokovat IP</button>
							</div>
						</div>
					</div>
				</div>
				<div class="p-4 bg-[#8b5cf6]/5">
					<div class="flex items-start gap-3">
						<div class="w-9 h-9 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
							<i class="fa-solid fa-bug text-[#8b5cf6] text-sm"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap mb-1">
								<p class="text-textMain text-sm font-semibold leading-tight">SQL Injection pokus</p>
								<span class="px-1.5 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs rounded font-medium">Vysoké</span>
							</div>
							<p class="text-xs text-textSec">IP: 92.118.160.47 · CN · WAF blok</p>
							<p class="text-xs text-textSec mt-0.5">Payload: <code class="text-[#8b5cf6] bg-[#1e293b] px-1 rounded text-xs">1' OR '1'='1</code></p>
							<div class="flex items-center justify-between mt-3">
								<span class="text-[#8b5cf6] font-bold text-xs">13:58 – aktivní</span>
								<button class="px-4 py-2 bg-[#8b5cf6] text-white text-xs font-medium rounded-lg hover:bg-[#7c3aed] transition-colors min-h-[36px]">Blokovat IP</button>
							</div>
						</div>
					</div>
				</div>
				<div class="p-4 bg-secondary/5">
					<div class="flex items-start gap-3">
						<div class="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
							<i class="fa-solid fa-key text-secondary text-sm"></i>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap mb-1">
								<p class="text-textMain text-sm font-semibold leading-tight">Podezřelý API klíč</p>
								<span class="px-1.5 py-0.5 bg-secondary/20 text-secondary text-xs rounded font-medium">Střední</span>
							</div>
							<p class="text-xs text-textSec">Key: sk_live_***8f2a · NG · u_4821</p>
							<p class="text-xs text-textSec mt-0.5">3,200 req/h (limit: 500)</p>
							<div class="flex items-center justify-between mt-3">
								<span class="text-secondary font-bold text-xs">12:15 – aktivní</span>
								<button class="px-4 py-2 bg-secondary text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors min-h-[36px]">Revokovat klíč</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Charts — tabbed -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="border-b border-[#1e293b]">
				<div class="flex">
					<button
						onclick={() => switchTab('threats')}
						class="flex-1 py-3 text-xs font-semibold transition-colors border-b-2 {activeTab === 'threats' ? 'text-textMain border-error' : 'text-textSec border-transparent hover:text-textMain'}"
					>
						Události v čase
					</button>
					<button
						onclick={() => switchTab('geo')}
						class="flex-1 py-3 text-xs font-semibold transition-colors border-b-2 {activeTab === 'geo' ? 'text-textMain border-error' : 'text-textSec border-transparent hover:text-textMain'}"
					>
						Geografie
					</button>
					<button
						onclick={() => switchTab('attacks')}
						class="flex-1 py-3 text-xs font-semibold transition-colors border-b-2 {activeTab === 'attacks' ? 'text-textMain border-error' : 'text-textSec border-transparent hover:text-textMain'}"
					>
						Typy útoků
					</button>
				</div>
			</div>
			{#if activeTab === 'threats'}
				<div class="p-4">
					<div class="flex items-center justify-between mb-3">
						<p class="text-xs text-textSec">Hrozby za hodinu</p>
						<div class="flex gap-2">
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-error inline-block"></span>Kritické</span>
							<span class="px-2 py-1 bg-badge rounded text-xs text-textSec flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-secondary inline-block"></span>Varování</span>
						</div>
					</div>
					<div id="chart-threats-m" class="h-[200px] w-full"></div>
				</div>
			{:else if activeTab === 'geo'}
				<div class="p-4">
					<p class="text-xs text-textSec mb-3">Top 5 zdrojových zemí</p>
					<div id="chart-geo-m" class="h-[200px] w-full"></div>
				</div>
			{:else if activeTab === 'attacks'}
				<div class="p-4">
					<p class="text-xs text-textSec mb-3">Distribuce detekovaných hrozeb</p>
					<div id="chart-attack-pie-m" class="h-[180px] w-full"></div>
					<div class="mt-3 grid grid-cols-2 gap-2">
						<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full bg-error flex-shrink-0"></span><span class="text-textSec">Brute Force</span><span class="text-textMain font-semibold ml-auto">42%</span></div>
						<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] flex-shrink-0"></span><span class="text-textSec">SQL Inject.</span><span class="text-textMain font-semibold ml-auto">28%</span></div>
						<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0"></span><span class="text-textSec">XSS</span><span class="text-textMain font-semibold ml-auto">18%</span></div>
						<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] flex-shrink-0"></span><span class="text-textSec">Rate Abuse</span><span class="text-textMain font-semibold ml-auto">12%</span></div>
					</div>
				</div>
			{/if}
		</section>

		<!-- Failed Logins Chart -->
		<section class="bg-card border border-[#1e293b] rounded-xl p-4">
			<div class="flex items-center justify-between mb-3">
				<div>
					<h3 class="text-sm font-semibold text-textMain">Neúspěšná přihlášení</h3>
					<p class="text-xs text-textSec mt-0.5">Pokusy za hodinu</p>
				</div>
			</div>
			<div id="chart-logins-m" class="h-[180px] w-full"></div>
		</section>

		<!-- Blocked IPs Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<div class="flex items-center justify-between px-4 py-4 min-h-[56px]">
				<button
					onclick={() => toggleAccordion('ips')}
					class="flex items-center gap-3 flex-1 text-left"
				>
					<div class="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
						<i class="fa-solid fa-ban text-error text-xs"></i>
					</div>
					<div class="text-left">
						<p class="text-sm font-semibold text-textMain">Blokované IP adresy</p>
						<p class="text-xs text-textSec">38 blokovaných · 5 zobrazeno</p>
					</div>
				</button>
				<div class="flex items-center gap-2 flex-shrink-0">
					<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs rounded-lg border border-[#334155] min-h-[36px]">
						<i class="fa-solid fa-plus mr-1"></i>Přidat
					</button>
					<button onclick={() => toggleAccordion('ips')} class="p-1" aria-label="Toggle">
						<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accordionOpen.ips ? 'rotate-180' : ''}"></i>
					</button>
				</div>
			</div>
			{#if accordionOpen.ips}
				<div class="border-t border-[#1e293b]">
					<div class="divide-y divide-[#1e293b]/60">
						<div class="flex items-center gap-3 p-4">
							<div class="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-ban text-error text-xs"></i></div>
							<div class="flex-1 min-w-0">
								<p class="text-textMain text-sm font-mono">185.234.219.14</p>
								<p class="text-xs text-textSec">RU · Brute force · 1,084x</p>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="px-1.5 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Auto</span>
								<span class="text-xs text-textSec">14:32</span>
							</div>
						</div>
						<div class="flex items-center gap-3 p-4">
							<div class="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-ban text-error text-xs"></i></div>
							<div class="flex-1 min-w-0">
								<p class="text-textMain text-sm font-mono">92.118.160.47</p>
								<p class="text-xs text-textSec">CN · SQL Injection · WAF</p>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="px-1.5 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">WAF</span>
								<span class="text-xs text-textSec">13:58</span>
							</div>
						</div>
						<div class="flex items-center gap-3 p-4">
							<div class="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-ban text-secondary text-xs"></i></div>
							<div class="flex-1 min-w-0">
								<p class="text-textMain text-sm font-mono">45.142.212.100</p>
								<p class="text-xs text-textSec">UA · Rate abuse · 8,200/h</p>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="px-1.5 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Auto</span>
								<span class="text-xs text-textSec">11:14</span>
							</div>
						</div>
						<div class="flex items-center gap-3 p-4">
							<div class="w-7 h-7 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-ban text-[#3b82f6] text-xs"></i></div>
							<div class="flex-1 min-w-0">
								<p class="text-textMain text-sm font-mono">103.21.244.0/22</p>
								<p class="text-xs text-textSec">IR · Manuální · CIDR</p>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="px-1.5 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Manual</span>
								<span class="text-xs text-textSec">09:20</span>
							</div>
						</div>
						<div class="flex items-center gap-3 p-4">
							<div class="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-ban text-error text-xs"></i></div>
							<div class="flex-1 min-w-0">
								<p class="text-textMain text-sm font-mono">194.165.16.75</p>
								<p class="text-xs text-textSec">KZ · Brute force · 521x</p>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="px-1.5 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Auto</span>
								<span class="text-xs text-textSec">22:41</span>
							</div>
						</div>
					</div>
					<div class="px-4 py-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-textSec">
						<span>5 z 38 blokovaných IP</span>
						<button class="text-[#3b82f6] font-medium min-h-[36px] px-2">Zobrazit vše →</button>
					</div>
				</div>
			{/if}
		</section>

		<!-- Security Event Log Accordion -->
		<section class="bg-card border border-[#1e293b] rounded-xl overflow-hidden">
			<button
				onclick={() => toggleAccordion('log')}
				class="w-full flex items-center justify-between px-4 py-4 min-h-[56px]"
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center">
						<i class="fa-solid fa-list text-textSec text-xs"></i>
					</div>
					<div class="text-left">
						<p class="text-sm font-semibold text-textMain">Security Event Log</p>
						<p class="text-xs text-textSec">47 záznamů · 24 hodin</p>
					</div>
				</div>
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accordionOpen.log ? 'rotate-180' : ''}"></i>
			</button>
			{#if accordionOpen.log}
				<div class="border-t border-[#1e293b]">
					<div class="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[#1e293b]">
						<button class="px-3 py-1.5 bg-error/20 text-error text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px]">Všechny</button>
						<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">Kritické</button>
						<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">Varování</button>
						<button class="px-3 py-1.5 bg-[#1e293b] text-textSec text-xs font-medium rounded-lg whitespace-nowrap min-h-[36px] hover:text-textMain">Info</button>
					</div>
					<div class="px-4 py-3 border-b border-[#1e293b]">
						<div class="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2.5">
							<i class="fa-solid fa-magnifying-glass text-textSec text-xs"></i>
							<input type="text" placeholder="Hledat v logu..." class="bg-transparent text-sm text-textMain placeholder-textSec outline-none flex-1" />
						</div>
					</div>
					<div class="divide-y divide-[#1e293b]/60">
						<div class="p-4">
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Brute Force</span>
									<span class="font-mono text-xs text-textSec">14:32:11</span>
								</div>
								<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">Aktivní</span>
							</div>
							<p class="text-sm text-textMain mb-1">1,084 neúspěšných přihlášení za 2 hodiny</p>
							<p class="text-xs text-textSec font-mono">185.234.219.14 · RU · /api/auth/login</p>
						</div>
						<div class="p-4">
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="px-2 py-0.5 bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs rounded font-medium">SQL Inject.</span>
									<span class="font-mono text-xs text-textSec">13:58:04</span>
								</div>
								<span class="px-2 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs rounded">Blokováno</span>
							</div>
							<p class="text-sm text-textMain mb-1">Pokus o SQL injection v parametru query</p>
							<p class="text-xs text-textSec font-mono">92.118.160.47 · CN · /api/products/search</p>
						</div>
						<div class="p-4">
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">Rate Abuse</span>
									<span class="font-mono text-xs text-textSec">13:21:39</span>
								</div>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Vyřešeno</span>
							</div>
							<p class="text-sm text-textMain mb-1">Překročení rate limitu 8,200 req/h</p>
							<p class="text-xs text-textSec font-mono">45.142.212.100 · UA · /api/export</p>
						</div>
						<div class="p-4">
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded font-medium">API Abuse</span>
									<span class="font-mono text-xs text-textSec">12:15:22</span>
								</div>
								<span class="px-2 py-0.5 bg-error/10 text-error text-xs rounded">Aktivní</span>
							</div>
							<p class="text-sm text-textMain mb-1">Podezřelý API klíč z regionu NG</p>
							<p class="text-xs text-textSec font-mono">sk_live_***8f2a · NG · /api/export</p>
						</div>
						<div class="p-4">
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">XSS</span>
									<span class="font-mono text-xs text-textSec">11:44:08</span>
								</div>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Blokováno</span>
							</div>
							<p class="text-sm text-textMain mb-1">XSS payload detekován v komentáři</p>
							<p class="text-xs text-textSec font-mono">78.141.212.55 · DE · /api/reviews</p>
						</div>
						<div class="p-4">
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="px-2 py-0.5 bg-[#3b82f6]/15 text-[#3b82f6] text-xs rounded font-medium">Port Scan</span>
									<span class="font-mono text-xs text-textSec">09:30:18</span>
								</div>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Blokováno</span>
							</div>
							<p class="text-sm text-textMain mb-1">Skenování 240 portů za 30 sekund</p>
							<p class="text-xs text-textSec font-mono">91.108.4.200 · NL · —</p>
						</div>
						<div class="p-4">
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="px-2 py-0.5 bg-error/15 text-error text-xs rounded font-medium">Brute Force</span>
									<span class="font-mono text-xs text-textSec">07:12:55</span>
								</div>
								<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded">Blokováno</span>
							</div>
							<p class="text-sm text-textMain mb-1">521 neúspěšných přihlášení – různé ID</p>
							<p class="text-xs text-textSec font-mono">194.165.16.75 · KZ · /api/auth/login</p>
						</div>
					</div>
					<div class="px-4 py-3 border-t border-[#1e293b]">
						<button class="w-full py-2.5 text-xs text-[#3b82f6] font-medium text-center min-h-[44px]">Načíst více záznamů →</button>
					</div>
				</div>
			{/if}
		</section>

		<div class="h-4"></div>
	</div>

	<!-- Bottom Navigation -->
	<nav class="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-[#1e293b] px-2 py-2 flex items-center justify-around lg:hidden">
		<a href="{base}/" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gauge-high text-base"></i>
			<span class="text-xs">Dashboard</span>
		</a>
		<a href="{base}/runtime" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-server text-base"></i>
			<span class="text-xs">Infra</span>
		</a>
		<a href="{base}/security" class="flex flex-col items-center gap-1 px-3 py-1.5 text-error relative min-w-[44px]">
			<div class="absolute -top-1 right-1/4 w-4 h-4 bg-error rounded-full flex items-center justify-center">
				<span class="text-white font-bold" style="font-size:9px">3</span>
			</div>
			<i class="fa-solid fa-shield-halved text-base"></i>
			<span class="text-xs font-semibold">Security</span>
		</a>
		<a href="{base}/business" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-chart-line text-base"></i>
			<span class="text-xs">Analytika</span>
		</a>
		<a href="{base}/nastaveni" class="flex flex-col items-center gap-1 px-3 py-1.5 text-textSec hover:text-textMain transition-colors min-w-[44px]">
			<i class="fa-solid fa-gear text-base"></i>
			<span class="text-xs">Nastavení</span>
		</a>
	</nav>
</div>

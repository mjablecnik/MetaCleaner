<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { chartColors } from '$lib/theme/chartColors';
	import { getBlockedIps } from '$lib/repositories/securityRepository';
	import BlockedIpRow from '../components/BlockedIpRow.svelte';

	type AccordionKey = 'ips';

	const blockedIps = getBlockedIps();

	let accordionOpen = $state<Record<AccordionKey, boolean>>({ ips: false });

	function toggleAccordion(key: AccordionKey) {
		accordionOpen[key] = !accordionOpen[key];
	}

	onMount(() => {
		const Plotly = (window as any).Plotly;
		if (!Plotly) return;

		const bgCard = chartColors.card;
		const textSec = chartColors.textSec;
		const errorColor = chartColors.error;
		const secondaryColor = chartColors.secondary;
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
		const logins = [28, 14, 10, 22, 65, 148, 210, 340, 180, 120, 88, 60];

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

		const elLogins = document.getElementById('chart-logins');
		if (elLogins) Plotly.newPlot('chart-logins', dataLogins, { ...commonLayout, bargap: 0.3, yaxis: { ...commonLayout.yaxis, title: { text: 'Pokusy', font: { size: 10, color: textSec } } } }, chartConfig);

		const elLoginsM = document.getElementById('chart-logins-m');
		if (elLoginsM) Plotly.newPlot('chart-logins-m', dataLogins, { ...mobileLayout, bargap: 0.3 }, chartConfig);

		const handleResize = () => {
			['chart-logins', 'chart-logins-m'].forEach(id => {
				const el = document.getElementById(id);
				if (el) Plotly.Plots.resize(el);
			});
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<!-- ===== DESKTOP: Blocked IPs + Failed Logins ===== -->
<section class="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('security_blockedIps_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('security_blockedIps_subtitle')}</p>
			</div>
			<button class="px-3 py-1.5 bg-surface hover:bg-surface-hover text-textSec hover:text-textMain text-xs rounded-lg border border-border transition-colors">
				<i class="fa-solid fa-plus mr-1.5"></i>{t('security_blockedIps_addIp')}
			</button>
		</div>
		<div class="space-y-2">
			{#each blockedIps as ip (ip.id)}
				<BlockedIpRow {ip} variant="desktop" />
			{/each}
		</div>
		<div class="mt-4 pt-3 border-t border-surface flex items-center justify-between text-xs text-textSec">
			<span>{t('security_blockedIps_footer')}</span>
			<button class="text-blue hover:text-blue-light transition-colors">{t('security_blockedIps_showAll')}</button>
		</div>
	</div>

	<div class="bg-card border border-surface rounded-xl p-5">
		<div class="flex justify-between items-center mb-4">
			<div>
				<h3 class="text-lg font-semibold text-textMain">{t('security_failedLogins_title')}</h3>
				<p class="text-xs text-textSec mt-0.5">{t('security_failedLogins_subtitle')}</p>
			</div>
		</div>
		<div id="chart-logins" class="h-[220px] w-full"></div>
	</div>
</section>

<!-- ===== MOBILE: Failed Logins Chart ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl p-4">
	<div class="flex items-center justify-between mb-3">
		<div>
			<h3 class="text-sm font-semibold text-textMain">{t('security_failedLogins_titleMobile')}</h3>
			<p class="text-xs text-textSec mt-0.5">{t('security_failedLogins_subtitleMobile')}</p>
		</div>
	</div>
	<div id="chart-logins-m" class="h-[180px] w-full"></div>
</section>

<!-- ===== MOBILE: Blocked IPs Accordion ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<div class="flex items-center justify-between px-4 py-4 min-h-[56px]">
		<button
			onclick={() => toggleAccordion('ips')}
			class="flex items-center gap-3 flex-1 text-left"
		>
			<div class="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
				<i class="fa-solid fa-ban text-error text-xs"></i>
			</div>
			<div class="text-left">
				<p class="text-sm font-semibold text-textMain">{t('security_blockedIps_title')}</p>
				<p class="text-xs text-textSec">{t('security_blockedIps_footerMobile')}</p>
			</div>
		</button>
		<div class="flex items-center gap-2 flex-shrink-0">
			<button class="px-3 py-1.5 bg-surface text-textSec text-xs rounded-lg border border-border min-h-[36px]">
				<i class="fa-solid fa-plus mr-1"></i>{t('security_blockedIps_addIpMobile')}
			</button>
			<button onclick={() => toggleAccordion('ips')} class="p-1" aria-label="Toggle">
				<i class="fa-solid fa-chevron-down text-textSec text-xs transition-transform duration-300 {accordionOpen.ips ? 'rotate-180' : ''}"></i>
			</button>
		</div>
	</div>
	{#if accordionOpen.ips}
		<div class="border-t border-surface">
			<div class="divide-y divide-surface/60">
				{#each blockedIps as ip (ip.id)}
					<BlockedIpRow {ip} variant="mobile" />
				{/each}
			</div>
			<div class="px-4 py-3 border-t border-surface flex items-center justify-between text-xs text-textSec">
				<span>{t('security_blockedIps_footerMobile')}</span>
				<button class="text-blue font-medium min-h-[36px] px-2">{t('security_blockedIps_showAll')}</button>
			</div>
		</div>
	{/if}
</section>

<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import { getSecuritySummary } from '$lib/repositories/securityRepository';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import SecurityKpiSection from './sections/SecurityKpiSection.svelte';
	import SecurityChartsSection from './sections/SecurityChartsSection.svelte';
	import SecurityThreatsSection from './sections/SecurityThreatsSection.svelte';
	import SecurityBlockedIpsSection from './sections/SecurityBlockedIpsSection.svelte';
	import SecurityEventLogSection from './sections/SecurityEventLogSection.svelte';

	const summary = getSecuritySummary();

	const navItems = [
		{ href: `${base}/`, icon: 'fa-gauge-high', label: t('layout_nav_dashboard') },
		{ href: `${base}/runtime`, icon: 'fa-microchip', label: t('layout_nav_runtime') },
		{
			href: `${base}/security`,
			icon: 'fa-shield-halved',
			label: t('layout_nav_security'),
			activeClass: 'text-error',
			badge: summary.activeThreats
		},
		{ href: `${base}/business`, icon: 'fa-chart-line', label: t('layout_nav_business') },
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-error animate-pulse"></div>
		{summary.activeThreats} {t('security_status_activeThreats')}
	</div>
{/snippet}

{#snippet actions()}
	<select
		class="bg-surface border border-border text-sm text-textMain rounded-lg px-3 py-2 focus:outline-none"
	>
		<option>{t('common_timeRange_last24h')}</option>
		<option>{t('common_timeRange_last7d')}</option>
		<option>{t('common_timeRange_last30d')}</option>
	</select>
	<button
		class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border"
	>
		<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
	</button>
{/snippet}

{#snippet mobileContent()}
	<div class="lg:hidden">
		<div
			class="px-4 pt-3 pb-3 bg-card border-b border-surface flex items-center justify-between gap-3"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 rounded-lg bg-error/15 border border-error/30 flex items-center justify-center"
				>
					<i class="fa-solid fa-shield-halved text-error text-xs"></i>
				</div>
				<div>
					<h1 class="text-base font-bold text-textMain leading-tight">{t('layout_nav_security')}</h1>
					<p class="text-xs text-textSec">{t('security_header_subtitleMobile')}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<div
					class="flex items-center gap-1.5 px-2.5 py-1.5 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-medium"
				>
					<div class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></div>
					{summary.activeThreats} {t('security_status_threats')}
				</div>
				<select
					class="bg-surface border border-border text-xs text-textMain rounded-lg px-2.5 py-2 focus:outline-none min-h-[36px]"
				>
					<option>{t('common_timeRange_last24h')}</option>
					<option>{t('common_timeRange_last7d')}</option>
					<option>{t('common_timeRange_last30d')}</option>
				</select>
			</div>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="layout_nav_security"
	subtitleKey="security_header_subtitle"
	icon="fa-shield-halved"
	iconContainerClass="bg-error/15 border border-error/30"
	iconClass="text-error text-sm"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 pb-20 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto">
	<SecurityKpiSection />
	<SecurityChartsSection />
	<SecurityThreatsSection />
	<SecurityBlockedIpsSection />
	<SecurityEventLogSection />
</div>

<MobileBottomNav items={navItems} activeHref="{base}/security" />

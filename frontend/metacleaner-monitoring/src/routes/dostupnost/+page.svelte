<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import { getIncidents } from '$lib/repositories/availabilityRepository';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import AvailabilityServiceCardsSection from './sections/AvailabilityServiceCardsSection.svelte';
	import AvailabilityHealthChecksSection from './sections/AvailabilityHealthChecksSection.svelte';
	import AvailabilityTimelineSection from './sections/AvailabilityTimelineSection.svelte';
	import AvailabilitySlaSection from './sections/AvailabilitySlaSection.svelte';

	const incidents = getIncidents();
	const activeIncident = incidents.find((i) => i.status === 'active');

	const navItems = [
		{ href: `${base}/`, icon: 'fa-gauge-high', label: t('layout_nav_dashboard') },
		{
			href: `${base}/dostupnost`,
			icon: 'fa-server',
			label: t('layout_nav_availability'),
			activeClass: 'text-primary'
		},
		{ href: `${base}/chyby`, icon: 'fa-triangle-exclamation', label: t('layout_nav_errors') },
		{ href: `${base}/performance`, icon: 'fa-bolt', label: t('layout_nav_performance') },
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
		{t('common_status_allSystemsOperational')}
	</div>
{/snippet}

{#snippet actions()}
	<select
		class="bg-surface border border-border text-sm text-textMain rounded-lg px-3 py-1.5 focus:outline-none"
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
	<div class="lg:hidden px-4 pt-4 space-y-3 pb-2">
		<div>
			<h1 class="text-xl font-bold text-textMain">{t('availability_header_title')}</h1>
			<p class="text-sm text-textSec mt-0.5">{t('availability_header_subtitleMobile')}</p>
		</div>
		{#if activeIncident}
			<div
				class="p-3 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center gap-3"
			>
				<div
					class="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0"
				>
					<i class="fa-solid fa-triangle-exclamation text-secondary text-sm"></i>
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold text-textMain">{t('availability_status_activeIncident')}</p>
					<p class="text-xs text-textSec truncate">{activeIncident.title} · {activeIncident.duration}</p>
				</div>
				<i class="fa-solid fa-chevron-right text-textSec text-xs flex-shrink-0"></i>
			</div>
		{/if}
		<select
			class="w-full bg-surface border border-border text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none"
			style="min-height:44px"
		>
			<option>{t('common_timeRange_last24h')}</option>
			<option>{t('common_timeRange_last7d')}</option>
			<option>{t('common_timeRange_last30d')}</option>
		</select>
	</div>
{/snippet}

<PageHeader
	titleKey="availability_header_title"
	subtitleKey="availability_header_subtitle"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 pt-4 pb-20 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto">
	<AvailabilityServiceCardsSection />
	<AvailabilityHealthChecksSection />
	<AvailabilityTimelineSection />
	<AvailabilitySlaSection />
</div>

<MobileBottomNav items={navItems} activeHref="{base}/dostupnost" />

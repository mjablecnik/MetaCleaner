<script lang="ts">
	import { base } from '$app/paths';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import NotConfiguredCard from '$lib/shared/components/NotConfiguredCard.svelte';
	import SectionErrorCard from '$lib/shared/components/SectionErrorCard.svelte';
	import AvailabilityServiceCardsSection from './sections/AvailabilityServiceCardsSection.svelte';
	import AvailabilityHealthChecksSection from './sections/AvailabilityHealthChecksSection.svelte';
	import AvailabilityTimelineSection from './sections/AvailabilityTimelineSection.svelte';
	import AvailabilitySlaSection from './sections/AvailabilitySlaSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const activeIncident = $derived(
		data.incidents.status === 'ok'
			? data.incidents.data.find((i) => i.status === 'active')
			: undefined
	);

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
					<p class="text-sm font-semibold text-textMain">
						{t('availability_status_activeIncident')}
					</p>
					<p class="text-xs text-textSec truncate">
						{activeIncident.title} · {activeIncident.duration}
					</p>
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
	{#if data.services.status === 'ok'}
		<AvailabilityServiceCardsSection services={data.services.data} />
	{:else if data.services.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.services.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.services.error.category}
			message={data.services.error.message}
			onretry={() => invalidate('app:dostupnost')}
		/>
	{/if}
	{#if data.healthChecks.status === 'ok'}
		<AvailabilityHealthChecksSection healthChecks={data.healthChecks.data} />
	{:else if data.healthChecks.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.healthChecks.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.healthChecks.error.category}
			message={data.healthChecks.error.message}
			onretry={() => invalidate('app:dostupnost')}
		/>
	{/if}
	{#if data.services.status === 'ok'}
		<AvailabilityTimelineSection services={data.services.data} />
	{/if}
	{#if data.slaGoals.status === 'ok' && data.incidents.status === 'ok'}
		<AvailabilitySlaSection slaGoals={data.slaGoals.data} incidents={data.incidents.data} />
	{:else if data.slaGoals.status === 'not-configured' || data.incidents.status === 'not-configured'}
		<NotConfiguredCard
			missingVars={data.slaGoals.status === 'not-configured'
				? data.slaGoals.missingVars
				: data.incidents.status === 'not-configured'
					? data.incidents.missingVars
					: []}
		/>
	{:else if data.slaGoals.status === 'error'}
		<SectionErrorCard
			category={data.slaGoals.error.category}
			message={data.slaGoals.error.message}
			onretry={() => invalidate('app:dostupnost')}
		/>
	{:else if data.incidents.status === 'error'}
		<SectionErrorCard
			category={data.incidents.error.category}
			message={data.incidents.error.message}
			onretry={() => invalidate('app:dostupnost')}
		/>
	{/if}
</div>

<MobileBottomNav items={navItems} activeHref="{base}/dostupnost" />

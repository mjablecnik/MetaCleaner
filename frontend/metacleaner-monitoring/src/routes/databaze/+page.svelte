<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import DatabaseKpiSection from './sections/DatabaseKpiSection.svelte';
	import DatabaseChartsSection from './sections/DatabaseChartsSection.svelte';
	import DatabaseQueriesSection from './sections/DatabaseQueriesSection.svelte';
	import DatabaseTablesSection from './sections/DatabaseTablesSection.svelte';
	import DatabaseErrorLogSection from './sections/DatabaseErrorLogSection.svelte';

	const navItems = [
		{ href: `${base}/`, icon: 'fa-gauge-high', label: t('layout_nav_dashboard') },
		{ href: `${base}/dostupnost`, icon: 'fa-server', label: t('layout_nav_availability') },
		{
			href: `${base}/databaze`,
			icon: 'fa-database',
			label: t('layout_nav_database'),
			activeClass: 'text-green-muted'
		},
		{ href: `${base}/performance`, icon: 'fa-bolt', label: t('layout_nav_performance') },
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet statusBadge()}
	<div
		class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium"
	>
		<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
		{t('database_status_online')}
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
		<div class="px-4 pt-3 pb-2">
			<div class="flex items-center gap-2.5">
				<div
					class="w-7 h-7 rounded-md bg-green-muted/15 border border-green-muted/30 flex items-center justify-center"
				>
					<i class="fa-solid fa-database text-green-muted text-xs"></i>
				</div>
				<div>
					<h1 class="text-sm font-bold text-textMain leading-tight">
						{t('database_header_title')}
					</h1>
					<p class="text-xs text-textSec">eu-west-1 · Prod</p>
				</div>
			</div>
		</div>
		<div class="px-4 pb-3">
			<div
				class="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-success text-xs font-medium w-fit"
			>
				<div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
				{t('database_status_online')}
			</div>
		</div>
		<div class="px-4 pb-4">
			<select
				class="w-full bg-card border border-border text-sm text-textMain rounded-xl px-4 py-3 focus:outline-none"
			>
				<option>{t('common_timeRange_last24h')}</option>
				<option>{t('common_timeRange_last7d')}</option>
				<option>{t('common_timeRange_last30d')}</option>
			</select>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="database_header_title"
	subtitleKey="database_header_subtitle"
	icon="fa-database"
	iconContainerClass="bg-green-muted/15 border border-green-muted/30"
	iconClass="text-green-muted text-sm"
	{statusBadge}
	{actions}
	{mobileContent}
/>

<div class="px-4 pb-20 space-y-4 lg:p-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto">
	<DatabaseKpiSection />
	<DatabaseChartsSection />
	<DatabaseQueriesSection />
	<DatabaseTablesSection />
	<DatabaseErrorLogSection />
</div>

<MobileBottomNav items={navItems} activeHref="{base}/databaze" />

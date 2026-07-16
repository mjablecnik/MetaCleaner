<script lang="ts">
	import { base } from '$app/paths';
	import { invalidate } from '$app/navigation';
	import { t } from '$lib/i18n';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import MobileBottomNav from '$lib/shared/components/MobileBottomNav.svelte';
	import NotConfiguredCard from '$lib/shared/components/NotConfiguredCard.svelte';
	import SectionErrorCard from '$lib/shared/components/SectionErrorCard.svelte';
	import UsersKpiSection from './sections/UsersKpiSection.svelte';
	import UsersTableSection from './sections/UsersTableSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchOpen = $state(false);

	function toggleSearch() {
		searchOpen = !searchOpen;
	}

	const navItems = [
		{ href: `${base}/`, icon: 'fa-gauge-high', label: t('layout_nav_dashboard') },
		{ href: `${base}/dostupnost`, icon: 'fa-server', label: t('layout_nav_availability') },
		{ href: `${base}/chyby`, icon: 'fa-triangle-exclamation', label: t('layout_nav_errors') },
		{
			href: `${base}/uzivatele`,
			icon: 'fa-users',
			label: t('layout_nav_users'),
			activeClass: 'text-primary'
		},
		{ href: `${base}/nastaveni`, icon: 'fa-gear', label: t('layout_nav_settings') }
	];
</script>

{#snippet actions()}
	<div class="relative">
		<i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textSec text-sm"></i>
		<input
			type="text"
			placeholder={t('users_search_placeholder')}
			class="pl-9 pr-4 py-2 bg-surface border border-border text-white text-sm rounded-lg focus:outline-none focus:border-primary w-64 placeholder-textSec"
		/>
	</div>
	<button
		class="px-4 py-2 bg-surface hover:bg-surface-hover text-white rounded-lg text-sm font-medium transition-colors border border-border"
	>
		<i class="fa-solid fa-download mr-2"></i>{t('common_actions_export')}
	</button>
{/snippet}

{#snippet mobileContent()}
	<div class="lg:hidden">
		<header
			class="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-surface px-4 py-3 flex items-center justify-between gap-3"
		>
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2">
					<div
						class="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xs"
					>
						M
					</div>
					<span class="text-base font-bold text-textMain tracking-tight">Monitorly</span>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<button
					onclick={toggleSearch}
					aria-label={t('common_actions_search')}
					class="w-10 h-10 flex items-center justify-center rounded-lg bg-badge border border-border text-textSec hover:text-textMain transition-colors"
				>
					<i class="fa-solid fa-search text-sm"></i>
				</button>
				<button
					aria-label={t('common_actions_download')}
					class="w-10 h-10 flex items-center justify-center rounded-lg bg-badge border border-border text-textSec hover:text-textMain transition-colors"
				>
					<i class="fa-solid fa-download text-sm"></i>
				</button>
			</div>
		</header>

		{#if searchOpen}
			<div class="bg-background/95 backdrop-blur-md border-b border-surface px-4 py-3">
				<div class="relative">
					<i
						class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-textSec text-sm"
					></i>
					<input
						type="text"
						placeholder={t('users_search_placeholder')}
						class="w-full pl-9 pr-10 py-3 bg-surface border border-border text-white text-sm rounded-xl focus:outline-none focus:border-primary placeholder-textSec"
					/>
					<button
						onclick={toggleSearch}
						aria-label={t('common_actions_close')}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-textSec hover:text-textMain"
					>
						<i class="fa-solid fa-xmark text-sm"></i>
					</button>
				</div>
			</div>
		{/if}

		<div class="px-4 pt-5 pb-2">
			<h1 class="text-xl font-bold text-textMain">{t('users_header_title')}</h1>
			<p class="text-xs text-textSec mt-0.5">{t('users_header_subtitle')}</p>
		</div>
	</div>
{/snippet}

<PageHeader
	titleKey="users_header_title"
	subtitleKey="users_header_subtitle"
	{actions}
	{mobileContent}
/>

<div class="px-4 pb-20 space-y-4 lg:px-6 lg:pb-6 lg:space-y-6 lg:max-w-7xl lg:mx-auto lg:pt-6">
	{#if data.stats.status === 'ok'}
		<UsersKpiSection stats={data.stats.data} />
	{:else if data.stats.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.stats.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.stats.error.category}
			message={data.stats.error.message}
			onretry={() => invalidate('app:uzivatele')}
		/>
	{/if}
	{#if data.users.status === 'ok'}
		<UsersTableSection users={data.users.data} />
	{:else if data.users.status === 'not-configured'}
		<NotConfiguredCard missingVars={data.users.missingVars} />
	{:else}
		<SectionErrorCard
			category={data.users.error.category}
			message={data.users.error.message}
			onretry={() => invalidate('app:uzivatele')}
		/>
	{/if}
</div>

<MobileBottomNav items={navItems} activeHref="{base}/uzivatele" />

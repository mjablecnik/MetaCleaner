<script lang="ts">
	import { t } from '$lib/i18n';
	import {
		getUsers,
		getUserTabs,
		userStatusConfig,
		userRoleColors,
		type User,
		type UserTab
	} from '$lib/repositories/usersRepository';
	import UserRow from '../components/UserRow.svelte';
	import UserCard from '../components/UserCard.svelte';
	import PaginationControls from '../components/PaginationControls.svelte';

	type TabKey = 'all' | 'online' | 'new' | 'inactive';

	const users = getUsers();
	const tabs = getUserTabs();

	let activeTab = $state<TabKey>('all');

	const filteredUsers = $derived(() => {
		if (activeTab === 'online') return users.filter((u: User) => u.status === 'online');
		if (activeTab === 'new') return users.slice(0, 4);
		if (activeTab === 'inactive') return users.filter((u: User) => u.status === 'offline');
		return users;
	});

	function switchTab(tab: TabKey) {
		activeTab = tab;
	}
</script>

<!-- ===== DESKTOP: Tabs + Table ===== -->
<section class="hidden lg:block bg-card border border-surface rounded-xl">
	<!-- Tab bar -->
	<div class="flex items-center justify-between px-5 pt-5 pb-0 border-b border-surface">
		<div class="flex gap-1">
			{#each tabs as tab (tab.key)}
				<button
					onclick={() => switchTab(tab.key)}
					class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors {activeTab === tab.key ? 'text-textMain border-primary' : 'text-textSec border-transparent hover:text-textMain'}"
				>
					{t(tab.labelKey)}
					<span class="ml-2 px-2 py-0.5 text-xs rounded-full {activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-badge text-textSec'}">{tab.count}</span>
				</button>
			{/each}
		</div>
		<div class="flex items-center gap-2 pb-3">
			<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors flex items-center gap-2">
				<i class="fa-solid fa-filter text-xs"></i> {t('common_actions_filter')}
			</button>
			<button class="px-3 py-1.5 bg-badge border border-border text-textSec text-sm rounded-lg hover:text-textMain transition-colors flex items-center gap-2">
				<i class="fa-solid fa-sort text-xs"></i> {t('users_actions_sort')}
			</button>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="text-left border-b border-surface">
					<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider">{t('users_table_user')}</th>
					<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider">{t('common_table_status')}</th>
					<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden md:table-cell">{t('users_table_registered')}</th>
					<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden lg:table-cell">{t('users_table_lastLogin')}</th>
					<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden lg:table-cell">{t('users_table_sessions')}</th>
					<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider hidden xl:table-cell">{t('common_table_location')}</th>
					<th class="px-5 py-3 text-xs font-semibold text-textSec uppercase tracking-wider">{t('common_table_role')}</th>
					<th class="px-5 py-3"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-surface/50">
				{#each filteredUsers() as u (u.id)}
					<UserRow user={u} />
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	<PaginationControls variant="desktop" />
</section>

<!-- ===== MOBILE: Tabs + Card List ===== -->
<section class="lg:hidden bg-card border border-surface rounded-xl overflow-hidden">
	<!-- Tabs — horizontally scrollable -->
	<div class="border-b border-surface">
		<div class="flex overflow-x-auto px-3 pt-3 gap-1" style="-webkit-overflow-scrolling: touch; scrollbar-width: none;">
			{#each tabs as tab (tab.key)}
				<button
					onclick={() => switchTab(tab.key)}
					class="flex-shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap {activeTab === tab.key ? 'text-textMain border-primary' : 'text-textSec border-transparent hover:text-textMain'}"
				>
					{t(tab.labelKey)}
					<span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full {activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-badge text-textSec'}">{tab.count}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Filter / Sort row -->
	<div class="flex items-center justify-between px-4 py-2.5 border-b border-surface/60">
		<p class="text-xs text-textSec">{t('common_pagination_showing', { from: '1', to: '10', total: '12 847' })}</p>
		<div class="flex items-center gap-2">
			<button class="flex items-center gap-1.5 px-3 py-1.5 bg-badge border border-border text-textSec text-xs rounded-lg hover:text-textMain transition-colors min-h-[36px]">
				<i class="fa-solid fa-filter text-xs"></i> {t('common_actions_filter')}
			</button>
			<button class="flex items-center gap-1.5 px-3 py-1.5 bg-badge border border-border text-textSec text-xs rounded-lg hover:text-textMain transition-colors min-h-[36px]">
				<i class="fa-solid fa-sort text-xs"></i> {t('users_actions_sort')}
			</button>
		</div>
	</div>

	<!-- User Cards -->
	<div class="divide-y divide-surface/50">
		{#each filteredUsers() as u (u.id)}
			<UserCard user={u} />
		{/each}
	</div>

	<!-- Pagination -->
	<PaginationControls variant="mobile" />
</section>

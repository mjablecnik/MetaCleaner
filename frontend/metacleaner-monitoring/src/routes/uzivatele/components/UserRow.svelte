<script lang="ts">
	import { t } from '$lib/i18n';
	import { userStatusConfig, userRoleColors, type User } from '$lib/repositories/usersRepository';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	const s = $derived(userStatusConfig[user.status]);
	const r = $derived(userRoleColors[user.role] ?? userRoleColors['Viewer']);
</script>

<tr class="hover:bg-surface/30 transition-colors group">
	<td class="px-5 py-3.5">
		<div class="flex items-center gap-3">
			<div class="relative flex-shrink-0">
				<img
					src={user.avatar}
					alt={user.name}
					class="w-9 h-9 rounded-full object-cover border border-border"
				/>
				<span
					class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full {s.dot} border-2 border-card"
				></span>
			</div>
			<div>
				<div class="text-textMain font-medium text-sm">{user.name}</div>
				<div class="text-textSec text-xs">{user.email}</div>
			</div>
		</div>
	</td>
	<td class="px-5 py-3.5">
		<span
			class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {s.bg} {s.text}"
		>
			<span class="w-1.5 h-1.5 rounded-full {s.dot}"></span>
			{t(s.labelKey)}
		</span>
	</td>
	<td class="px-5 py-3.5 text-textSec text-xs hidden md:table-cell">{user.registered}</td>
	<td class="px-5 py-3.5 text-textSec text-xs hidden lg:table-cell">{user.lastLogin}</td>
	<td class="px-5 py-3.5 text-textMain text-xs font-medium hidden lg:table-cell">{user.sessions}</td
	>
	<td class="px-5 py-3.5 hidden xl:table-cell">
		<div class="flex items-center gap-1.5 text-xs text-textSec">
			<i class="fa-solid fa-location-dot text-[10px]"></i>
			{user.location}
		</div>
	</td>
	<td class="px-5 py-3.5">
		<span class="px-2.5 py-1 rounded-md text-xs font-medium {r}">{user.role}</span>
	</td>
	<td class="px-5 py-3.5 text-right">
		<button
			aria-label={t('common_table_action')}
			class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-badge border border-border text-textSec text-xs rounded-md hover:text-textMain"
		>
			<i class="fa-solid fa-ellipsis-h"></i>
		</button>
	</td>
</tr>

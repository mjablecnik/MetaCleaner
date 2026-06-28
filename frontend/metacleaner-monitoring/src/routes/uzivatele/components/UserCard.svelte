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

<div class="flex items-center gap-3 px-4 py-3.5 hover:bg-surface/30 active:bg-surface/50 transition-colors min-h-[72px]">
	<div class="relative flex-shrink-0">
		<img src={user.avatar} alt={user.name} class="w-11 h-11 rounded-full object-cover border border-border" />
		<span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full {s.dot} border-2 border-card"></span>
	</div>
	<div class="flex-1 min-w-0">
		<div class="flex items-center justify-between gap-2 mb-0.5">
			<span class="text-textMain font-semibold text-sm truncate">{user.name}</span>
			<span class="px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 {r}">{user.role}</span>
		</div>
		<div class="text-textSec text-xs truncate mb-1">{user.email}</div>
		<div class="flex items-center gap-2">
			<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {s.bg} {s.text}">
				<span class="w-1.5 h-1.5 rounded-full {s.dot}"></span>
				{t(s.labelKey)}
			</span>
			<span class="text-textSec text-xs">{user.lastLogin}</span>
			<span class="text-textSec text-xs ml-auto">
				<i class="fa-solid fa-location-dot text-[9px] mr-0.5"></i>{user.location.split(',')[0]}
			</span>
		</div>
	</div>
	<button class="w-9 h-9 flex items-center justify-center rounded-lg bg-badge border border-border text-textSec hover:text-white transition-colors flex-shrink-0 ml-1">
		<i class="fa-solid fa-ellipsis-vertical text-xs"></i>
	</button>
</div>

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { User } from '$lib/repositories/userRepository';

	interface Props {
		user: User | null;
		open?: boolean;
		onToggle?: () => void;
		onLogout?: () => void;
		wrapperId?: string;
	}

	let {
		user,
		open = $bindable(false),
		onToggle,
		onLogout,
		wrapperId = 'userDropdown'
	}: Props = $props();

	function handleToggle() {
		open = !open;
		onToggle?.();
	}
</script>

<div id={wrapperId} class="relative inline-block">
	<button
		type="button"
		onclick={handleToggle}
		class="flex items-center gap-2.5 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
	>
		<div
			class="flex h-7 w-7 items-center justify-center rounded-full border border-brand-blue/40 bg-brand-blue/20"
		>
			<i class="fa-solid fa-user text-xs text-brand-blue"></i>
		</div>
		<span class="hidden md:block">{user?.name ?? ''}</span>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform {open
				? 'rotate-180'
				: ''}"
		></i>
	</button>
	<div class="lang-dropdown-menu" class:open style="min-width:200px">
		<div class="border-b border-gray-700 px-4 py-3">
			<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
			<p class="mt-0.5 text-sm font-semibold text-white">{user?.email ?? ''}</p>
		</div>
		<a class="lang-option" href={resolve('/reports' as Pathname)}>
			<i class="fa-solid fa-clock-rotate-left text-sm text-text-muted"></i>
			<span>{tx('common.nav.reportHistory')}</span>
		</a>
		<a class="lang-option" href={resolve('/pricing' as Pathname)}>
			<i class="fa-solid fa-tag text-sm text-text-muted"></i>
			<span>{tx('common.nav.pricing')}</span>
		</a>
		<a class="lang-option" href={resolve('/api-keys' as Pathname)}>
			<i class="fa-solid fa-key text-sm text-text-muted"></i>
			<span>{tx('common.nav.apiKeys')}</span>
		</a>
		<div
			class="lang-option lang-option-danger"
			role="button"
			tabindex="0"
			onclick={() => onLogout?.()}
			onkeydown={(e) => e.key === 'Enter' && onLogout?.()}
		>
			<i class="fa-solid fa-right-from-bracket text-sm text-brand-red"></i>
			<span>{tx('common.nav.logout')}</span>
		</div>
	</div>
</div>

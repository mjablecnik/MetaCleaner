<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { User } from '$lib/repositories/userRepository';

	interface Props {
		user: User | null;
		open?: boolean;
		onToggle?: () => void;
		wrapperId?: string;
	}

	let {
		user,
		open = $bindable(false),
		onToggle,
		wrapperId = 'userDropdown',
	}: Props = $props();

	function tx(key: string): string {
		currentLocale; // reactive dependency
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}

	function handleToggle() {
		open = !open;
		onToggle?.();
	}
</script>

<div id={wrapperId} class="relative inline-block">
	<button
		type="button"
		onclick={handleToggle}
		class="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
	>
		<div
			class="w-7 h-7 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center"
		>
			<i class="fa-solid fa-user text-brand-blue text-xs"></i>
		</div>
		<span class="hidden md:block">{user?.name ?? ''}</span>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform {open
				? 'rotate-180'
				: ''}"
		></i>
	</button>
	<div class="lang-dropdown-menu" class:open style="min-width:200px">
		<div class="px-4 py-3 border-b border-gray-700">
			<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
			<p class="text-sm font-semibold text-white mt-0.5">{user?.email ?? ''}</p>
		</div>
		<div
			class="lang-option"
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
		>
			<i class="fa-solid fa-gear text-text-muted text-sm"></i>
			<span>{tx('common.nav.settings')}</span>
		</div>
		<div
			class="lang-option lang-option-danger"
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
		>
			<i class="fa-solid fa-right-from-bracket text-sm text-brand-red"></i>
			<span>{tx('common.nav.logout')}</span>
		</div>
	</div>
</div>

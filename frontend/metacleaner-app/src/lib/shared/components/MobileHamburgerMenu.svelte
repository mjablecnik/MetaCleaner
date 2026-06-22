<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { locale } from '$lib/locale.svelte';
	import type { Language } from '$lib/repositories/languageRepository';
	import type { User } from '$lib/repositories/userRepository';

	interface Props {
		user: User | null;
		langOptions: Language[];
		open?: boolean;
		onSelect: (code: string) => void;
		onLogout?: () => void;
		wrapperId?: string;
	}

	let {
		user,
		langOptions,
		open = $bindable(false),
		onSelect,
		onLogout,
		wrapperId = 'hamburgerDropdown'
	}: Props = $props();

	function handleSelect(code: string) {
		onSelect(code);
		open = false;
	}

	function handleClose() {
		open = false;
	}
</script>

<div id={wrapperId} class="flex items-center gap-2 lg:hidden">
	<button
		type="button"
		onclick={() => (open = !open)}
		aria-label={open ? tx('common.closeMenu') : tx('common.openMenu')}
		aria-expanded={open}
		class="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-white"
	>
		<i class="fa-solid {open ? 'fa-xmark' : 'fa-bars'} text-base"></i>
	</button>

	<!-- Backdrop -->
	{#if open}
		<div
			class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
			onclick={handleClose}
			role="button"
			tabindex="-1"
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
		></div>
	{/if}

	<!-- Full-screen drawer -->
	<div
		class="fixed top-0 right-0 z-40 flex h-full w-full flex-col border-l border-gray-800 bg-navy-card shadow-2xl transition-transform duration-300
			{open ? 'translate-x-0' : 'translate-x-full'}"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-800 px-6 py-4">
			<div class="flex items-center gap-2.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue"
				>
					<i class="fa-solid fa-shield-halved text-base"></i>
				</div>
				<span class="text-lg font-bold tracking-tight text-white">{tx('common.brandName')}</span>
			</div>
			<button
				onclick={handleClose}
				aria-label={tx('common.closeMenu')}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-white"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
			<!-- User info -->
			{#if user}
				<div class="mb-3 rounded-xl border border-gray-800 bg-navy-main/60 px-4 py-3">
					<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
					<p class="mt-0.5 truncate text-sm font-semibold text-white">{user.email}</p>
				</div>
			{/if}

			<!-- Language section -->
			<p class="mb-2 px-2 text-[10px] font-bold tracking-widest text-text-muted uppercase">
				{tx('common.nav.language')}
			</p>
			{#each langOptions as lang (lang.code)}
				<button
					class="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-text-muted transition-all
						{locale.current === lang.code
						? 'bg-navy-lighter text-white'
						: 'hover:bg-navy-lighter hover:text-white'}"
					onclick={() => handleSelect(lang.code)}
				>
					<img src={lang.flag} alt={lang.label} class="h-5 w-7 rounded-sm object-cover" />
					<span class="text-sm font-medium">{lang.name}</span>
					{#if locale.current === lang.code}
						<i class="fa-solid fa-check ml-auto text-xs text-brand-blue"></i>
					{/if}
				</button>
			{/each}

			<div class="my-3 border-t border-gray-800"></div>

			<!-- Reports -->
			<a
				href={resolve('/reports' as Pathname)}
				onclick={handleClose}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted transition-all hover:bg-navy-lighter hover:text-white"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue/10 text-sm text-brand-blue"
				>
					<i class="fa-solid fa-file-lines"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.reportHistory')}</span>
				<i class="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40"></i>
			</a>

			<!-- Pricing -->
			<a
				href={resolve('/pricing' as Pathname)}
				onclick={handleClose}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted transition-all hover:bg-navy-lighter hover:text-white"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-lighter text-sm text-text-muted"
				>
					<i class="fa-solid fa-tag"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.pricing')}</span>
				<i class="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40"></i>
			</a>

			<!-- API Keys -->
			<a
				href={resolve('/api-keys' as Pathname)}
				onclick={handleClose}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-text-muted transition-all hover:bg-navy-lighter hover:text-white"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-lighter text-sm text-text-muted"
				>
					<i class="fa-solid fa-key"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.apiKeys')}</span>
				<i class="fa-solid fa-chevron-right ml-auto text-[10px] opacity-40"></i>
			</a>

			<div class="my-3 border-t border-gray-800"></div>

			<!-- Logout -->
			<button
				class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-brand-red transition-all hover:bg-brand-red/10"
				onclick={() => {
					onLogout?.();
					open = false;
				}}
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/10 text-sm text-brand-red"
				>
					<i class="fa-solid fa-right-from-bracket"></i>
				</div>
				<span class="text-sm font-medium">{tx('common.nav.logout')}</span>
			</button>
		</div>
	</div>
</div>

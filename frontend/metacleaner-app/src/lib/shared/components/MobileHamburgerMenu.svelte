<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { Language } from '$lib/repositories/languageRepository';
	import type { User } from '$lib/repositories/userRepository';

	interface Props {
		user: User | null;
		langOptions: Language[];
		open?: boolean;
		onSelect: (code: string) => void;
		wrapperId?: string;
	}

	let {
		user,
		langOptions,
		open = $bindable(false),
		onSelect,
		wrapperId = 'hamburgerDropdown'
	}: Props = $props();

	function tx(key: string): string {
		void locale.current; // reactive dependency
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}

	function handleSelect(code: string) {
		onSelect(code);
		open = false;
	}
</script>

<div id={wrapperId} class="flex items-center gap-2 lg:hidden">
	<div class="relative inline-block">
		<button
			type="button"
			onclick={() => (open = !open)}
			class="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-white"
		>
			<i class="fa-solid {open ? 'fa-xmark' : 'fa-bars'} text-base"></i>
		</button>
		<div class="lang-dropdown-menu" class:open style="min-width:220px">
			<div class="border-b border-gray-700 px-4 py-3">
				<p class="text-xs text-text-muted">{tx('common.nav.loggedInAs')}</p>
				<p class="mt-0.5 truncate text-sm font-semibold text-white">{user?.email ?? ''}</p>
			</div>
			<div class="border-b border-gray-700 px-4 py-2">
				<p class="mb-1 text-[10px] tracking-wider text-text-muted uppercase">
					{tx('common.nav.language')}
				</p>
				<div class="flex flex-col gap-0.5">
					{#each langOptions as lang (lang.code)}
						<div
							class="lang-option rounded-lg"
							class:active={locale.current === lang.code}
							onclick={() => handleSelect(lang.code)}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && handleSelect(lang.code)}
						>
							<img src={lang.flag} alt={lang.label} class="h-4 w-6 rounded-sm object-cover" />
							{lang.name}
							{#if locale.current === lang.code}
								<span class="lang-check"><i class="fa-solid fa-check text-xs"></i></span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
			<div
				class="lang-option"
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
			>
				<i class="fa-solid fa-gear text-sm text-text-muted"></i>
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
</div>

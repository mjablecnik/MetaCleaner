<script lang="ts">
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';

	let { variant = 'desktop' }: { variant?: 'desktop' | 'mobile' } = $props();

	const localeMap: Record<string, { flag: string; label: string; name: string }> = {
		en: { flag: '🇬🇧', label: 'EN', name: 'English' },
		cs: { flag: '🇨🇿', label: 'CS', name: 'Čeština' }
	};

	type Locale = (typeof locales)[number];

	let dropdownOpen = $state(false);
	let currentLocale = $state<Locale>(getLocale() as Locale);
	let wrapperEl = $state<HTMLElement | undefined>(undefined);

	function chooseLocale(locale: Locale) {
		currentLocale = locale;
		dropdownOpen = false;
		setLocale(locale);
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	onMount(() => {
		function handleOutside(e: MouseEvent) {
			if (wrapperEl && !wrapperEl.contains(e.target as Node)) {
				dropdownOpen = false;
			}
		}
		document.addEventListener('click', handleOutside);
		return () => document.removeEventListener('click', handleOutside);
	});
</script>

{#if variant === 'desktop'}
	<div class="lang-dropdown" bind:this={wrapperEl}>
		<button
			onclick={toggleDropdown}
			class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
		>
			<span>{localeMap[currentLocale]?.flag ?? '🌐'}</span>
			<span>{localeMap[currentLocale]?.label ?? currentLocale.toUpperCase()}</span>
			<i
				class="fa-solid fa-chevron-down text-text-muted text-xs ml-1 {dropdownOpen
					? 'rotate-180'
					: ''}"
			></i>
		</button>
		<div class="lang-dropdown-menu {dropdownOpen ? 'open' : ''}">
			{#each locales as locale (locale)}
				<div
					onclick={() => chooseLocale(locale)}
					class="lang-option {currentLocale === locale ? 'active' : ''}"
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && chooseLocale(locale)}
				>
					<span class="lang-flag">{localeMap[locale]?.flag}</span>
					{localeMap[locale]?.name}
					<span class="lang-check {currentLocale === locale ? '' : 'hidden'}">
						<i class="fa-solid fa-check text-xs"></i>
					</span>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div bind:this={wrapperEl}>
		<p class="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 mb-2">
			{m.nav_language()}
		</p>
		<div class="px-1 relative">
			<button
				onclick={toggleDropdown}
				class="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-700 bg-navy-lighter text-white text-sm font-semibold transition-all hover:border-brand-blue/50"
			>
				<div class="flex items-center gap-3">
					<span class="text-xl">{localeMap[currentLocale]?.flag ?? '🌐'}</span>
					<span class="text-sm font-semibold"
						>{localeMap[currentLocale]?.name ?? currentLocale}</span
					>
				</div>
				<i
					class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform duration-200 {dropdownOpen
						? 'rotate-180'
						: ''}"
				></i>
			</button>
			<div
				class="{dropdownOpen
					? ''
					: 'hidden'} absolute left-0 right-0 mt-2 bg-navy-card border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl"
			>
				{#each locales as locale, i (locale)}
					<button
						onclick={() => chooseLocale(locale)}
						class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-navy-lighter hover:text-white transition-all {i >
						0
							? 'border-t border-gray-800'
							: ''} {currentLocale === locale ? 'text-white bg-navy-lighter' : 'text-text-muted'}"
					>
						<span class="text-xl">{localeMap[locale]?.flag}</span>
						<span class="flex-1 text-left">{localeMap[locale]?.name}</span>
						<i
							class="fa-solid fa-check text-brand-blue text-xs {currentLocale === locale
								? ''
								: 'hidden'}"
						></i>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

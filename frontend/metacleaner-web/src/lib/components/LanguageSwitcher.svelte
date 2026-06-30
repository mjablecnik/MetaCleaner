<script lang="ts">
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';
	import flagEn from '$lib/assets/flags/en.svg';
	import flagCs from '$lib/assets/flags/cs.svg';

	let { variant = 'desktop' }: { variant?: 'desktop' | 'mobile' } = $props();

	const localeMap: Record<string, { flag: string; label: string; name: string }> = {
		en: { flag: flagEn, label: 'EN', name: 'English' },
		cs: { flag: flagCs, label: 'CS', name: 'Čeština' }
	};

	type Locale = (typeof locales)[number];

	let dropdownOpen = $state(false);
	let currentLocale = $state<Locale>(getLocale() as Locale);
	let wrapperEl = $state<HTMLElement | undefined>(undefined);

	function chooseLocale(locale: Locale) {
		currentLocale = locale;
		dropdownOpen = false;

		// Save scroll position before locale change so we can restore it after reload
		sessionStorage.setItem('__locale_scroll_y', String(window.scrollY));

		// Remove hash fragment before locale change to prevent scrolling back to anchor
		if (window.location.hash) {
			history.replaceState(null, '', window.location.pathname + window.location.search);
		}

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
	<div class="relative inline-block" bind:this={wrapperEl}>
		<button
			onclick={toggleDropdown}
			class="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-lighter border border-gray-700 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
		>
			<img
				src={localeMap[currentLocale]?.flag}
				alt=""
				width="20"
				height="16"
				class="w-5 h-4 rounded-sm object-cover"
			/>
			<span>{localeMap[currentLocale]?.label ?? currentLocale.toUpperCase()}</span>
			<i
				class="fa-solid fa-chevron-down text-text-muted text-xs ml-1 {dropdownOpen
					? 'rotate-180'
					: ''}"
			></i>
		</button>
		<div
			class="{dropdownOpen
				? 'block'
				: 'hidden'} absolute right-0 top-[calc(100%+8px)] bg-navy-card border border-border-strong rounded-[10px] min-w-[160px] z-[200] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
		>
			{#each locales as locale (locale)}
				<div
					onclick={() => chooseLocale(locale)}
					class="flex items-center gap-[10px] px-4 py-[10px] cursor-pointer text-[13px] font-medium transition-[background,color] duration-150 hover:bg-navy-lighter hover:text-white {currentLocale ===
					locale
						? 'bg-navy-lighter text-white'
						: 'text-text-muted'}"
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && chooseLocale(locale)}
				>
					<img
						src={localeMap[locale]?.flag}
						alt=""
						width="20"
						height="16"
						class="w-5 h-4 rounded-sm object-cover"
					/>
					{localeMap[locale]?.name}
					<span class="ml-auto text-brand-blue {currentLocale === locale ? '' : 'hidden'}">
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
					<img
						src={localeMap[currentLocale]?.flag}
						alt=""
						width="20"
						height="16"
						class="w-5 h-4 rounded-sm object-cover"
					/>
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
						<img
							src={localeMap[locale]?.flag}
							alt=""
							width="20"
							height="16"
							class="w-5 h-4 rounded-sm object-cover"
						/>
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

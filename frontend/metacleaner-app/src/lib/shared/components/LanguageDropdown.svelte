<script lang="ts">
	import type { Language } from '$lib/repositories/languageRepository';

	interface Props {
		langOptions: Language[];
		currentLocale: string;
		open?: boolean;
		onSelect: (code: string) => void;
		wrapperId?: string;
	}

	let {
		langOptions,
		currentLocale,
		open = $bindable(false),
		onSelect,
		wrapperId = 'langDropdown'
	}: Props = $props();

	const currentLangInfo = $derived(
		langOptions.find((l) => l.code === currentLocale) ?? langOptions[0]
	);
</script>

<div id={wrapperId} class="relative inline-block">
	<button
		type="button"
		onclick={() => (open = !open)}
		class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
	>
		<img
			src={currentLangInfo?.flag ?? ''}
			alt={currentLangInfo?.label ?? ''}
			class="h-4 w-6 rounded-sm object-cover"
		/>
		<span>{currentLangInfo?.label ?? ''}</span>
		<i
			class="fa-solid fa-chevron-down ml-1 text-xs text-text-muted transition-transform {open
				? 'rotate-180'
				: ''}"
		></i>
	</button>
	<div class="lang-dropdown-menu" class:open style="min-width:160px">
		{#each langOptions as lang (lang.code)}
			<div
				class="lang-option"
				class:active={currentLocale === lang.code}
				onclick={() => onSelect(lang.code)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && onSelect(lang.code)}
			>
				<img src={lang.flag} alt={lang.label} class="h-4 w-6 rounded-sm object-cover" />
				{lang.name}
				{#if currentLocale === lang.code}
					<span class="lang-check"><i class="fa-solid fa-check text-xs"></i></span>
				{/if}
			</div>
		{/each}
	</div>
</div>

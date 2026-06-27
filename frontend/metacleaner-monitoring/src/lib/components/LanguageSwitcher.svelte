<script lang="ts">
	import { locale, switchLocale } from '$lib/locale.svelte';
	import { t } from '$lib/i18n';
</script>

<div class="flex items-center gap-1 px-3 py-2">
	<span class="text-xs text-textSec mr-1">{t('language_switcher_label')}:</span>
	<button
		onclick={() => switchLocale('en')}
		class="px-2 py-1 rounded text-xs font-medium transition-colors {locale.current === 'en'
			? 'bg-primary/20 text-primary border border-primary/30'
			: 'text-textSec hover:text-textMain hover:bg-[#1e293b]/50'}"
		aria-pressed={locale.current === 'en'}
	>
		EN
	</button>
	<button
		onclick={() => switchLocale('cs')}
		class="px-2 py-1 rounded text-xs font-medium transition-colors {locale.current === 'cs'
			? 'bg-primary/20 text-primary border border-primary/30'
			: 'text-textSec hover:text-textMain hover:bg-[#1e293b]/50'}"
		aria-pressed={locale.current === 'cs'}
	>
		CS
	</button>
</div>

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
</script>

<div class="flex flex-col items-center gap-4 py-6 text-center">
	<div
		class="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-700 bg-navy-main"
	>
		<i class="fa-solid fa-key text-xl text-text-muted"></i>
	</div>
	<p class="text-sm text-text-muted">{tx('apiKeys.emptyState.title')}</p>
	<button
		type="button"
		class="flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400 active:scale-95"
	>
		<i class="fa-solid fa-plus"></i>
		{tx('apiKeys.createButton')}
	</button>
</div>

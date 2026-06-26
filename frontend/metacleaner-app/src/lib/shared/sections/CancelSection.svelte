<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		periodEndDate: string;
		onCancel: () => void;
	}

	const { periodEndDate, onCancel }: Props = $props();

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});

	function warningText() {
		void locale.current;
		return tx('subscription.cancel.warning', { date: formattedDate() });
	}
</script>

<div class="rounded-2xl border border-red-800/30 bg-red-950/20 p-5 lg:p-6">
	<h3 class="mb-2 text-base font-semibold text-red-400">
		{tx('subscription.cancel.title')}
	</h3>
	<p class="mb-4 text-sm leading-relaxed text-text-muted">
		{warningText()}
	</p>
	<button
		onclick={onCancel}
		class="rounded-xl border border-red-700/50 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-600/20 active:scale-[0.98]"
	>
		{tx('subscription.cancel.button')}
	</button>
</div>

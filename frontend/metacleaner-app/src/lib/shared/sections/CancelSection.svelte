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
		if (!periodEndDate) {
			void locale.current;
			return tx('subscription.cancel.endOfPeriod');
		}
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});

	function warningText() {
		void locale.current;
		return tx('subscription.cancel.warning', { date: formattedDate() });
	}
</script>

<div class="rounded-2xl border border-gray-800 bg-navy-card p-5">
	<!-- Desktop: horizontal layout -->
	<div class="hidden items-center gap-4 lg:flex">
		<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red/10">
			<i class="fa-solid fa-ban text-sm text-brand-red"></i>
		</div>
		<div class="flex-1">
			<h3 class="text-sm font-bold">{tx('subscription.cancel.title')}</h3>
			<p class="mt-0.5 text-xs leading-relaxed text-text-muted">
				{warningText()}
			</p>
		</div>
		<button
			onclick={onCancel}
			class="shrink-0 rounded-xl border border-brand-red/50 px-5 py-2.5 text-sm font-semibold text-brand-red transition-colors hover:bg-red-950"
		>
			{tx('subscription.cancel.button')}
		</button>
	</div>

	<!-- Mobile: vertical layout -->
	<div class="flex flex-col lg:hidden">
		<div class="mb-3 flex items-start gap-3">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red/10">
				<i class="fa-solid fa-ban text-sm text-brand-red"></i>
			</div>
			<div>
				<h3 class="text-sm font-bold">{tx('subscription.cancel.title')}</h3>
				<p class="mt-0.5 text-xs leading-relaxed text-text-muted">
					{warningText()}
				</p>
			</div>
		</div>
		<button
			onclick={onCancel}
			class="w-full rounded-xl border border-brand-red/50 py-3 text-sm font-semibold text-brand-red transition-colors hover:bg-red-950"
		>
			{tx('subscription.cancel.button')}
		</button>
	</div>
</div>

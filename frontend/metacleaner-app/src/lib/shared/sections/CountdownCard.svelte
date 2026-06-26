<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { locale } from '$lib/locale.svelte';
	import { formatDate } from '$lib/shared/utils/planHierarchy';

	interface Props {
		periodEndDate: string;
	}

	const { periodEndDate }: Props = $props();

	const formattedDate = $derived(() => {
		void locale.current;
		return formatDate(periodEndDate, locale.current as 'en' | 'cs');
	});

	function getCountdown() {
		const end = new Date(periodEndDate).getTime();
		const remaining = Math.max(0, end - Date.now());
		const totalSeconds = Math.floor(remaining / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		return { days, hours, minutes };
	}

	function getProgress() {
		const end = new Date(periodEndDate).getTime();
		// Assume 30-day billing cycle to compute elapsed proportion
		const start = end - 30 * 24 * 60 * 60 * 1000;
		const now = Date.now();
		return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
	}

	let countdown = $state(getCountdown());
	let progress = $state(getProgress());

	$effect(() => {
		const id = setInterval(() => {
			countdown = getCountdown();
			progress = getProgress();
		}, 60_000);
		return () => clearInterval(id);
	});
</script>

<div
	class="relative overflow-hidden rounded-2xl border border-brand-orange/30 bg-navy-card p-4 lg:p-5"
>
	<!-- Background decoration -->
	<div
		class="absolute top-0 right-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-brand-orange opacity-5 lg:h-32 lg:w-32 lg:translate-x-10 lg:-translate-y-10"
	></div>

	<!-- Title -->
	<p class="mb-3 text-xs font-semibold tracking-wider text-text-muted uppercase lg:mb-4">
		{tx('subscription.cancelling.countdown.title')}
	</p>

	<!-- Countdown digits -->
	<div class="mb-3 flex items-center justify-center gap-2 lg:mb-4 lg:gap-3">
		<!-- Days -->
		<div
			class="flex flex-1 flex-col items-center rounded-xl bg-navy-lighter px-4 py-2.5 lg:min-w-[60px] lg:flex-none lg:py-3"
		>
			<span class="text-3xl font-black text-brand-orange">{countdown.days}</span>
			<span class="mt-0.5 text-xs text-text-muted"
				>{tx('subscription.cancelling.countdown.days')}</span
			>
		</div>
		<span class="text-xl font-black text-gray-700 lg:text-2xl">:</span>
		<!-- Hours -->
		<div
			class="flex flex-1 flex-col items-center rounded-xl bg-navy-lighter px-4 py-2.5 lg:min-w-[60px] lg:flex-none lg:py-3"
		>
			<span class="text-3xl font-black text-white">{String(countdown.hours).padStart(2, '0')}</span>
			<span class="mt-0.5 text-xs text-text-muted"
				>{tx('subscription.cancelling.countdown.hours')}</span
			>
		</div>
		<span class="text-xl font-black text-gray-700 lg:text-2xl">:</span>
		<!-- Minutes -->
		<div
			class="flex flex-1 flex-col items-center rounded-xl bg-navy-lighter px-4 py-2.5 lg:min-w-[60px] lg:flex-none lg:py-3"
		>
			<span class="text-3xl font-black text-white"
				>{String(countdown.minutes).padStart(2, '0')}</span
			>
			<span class="mt-0.5 text-xs text-text-muted"
				>{tx('subscription.cancelling.countdown.minutes')}</span
			>
		</div>
	</div>

	<!-- Progress bar -->
	<div class="mb-2 h-2 w-full overflow-hidden rounded-full bg-navy-lighter lg:mb-4">
		<div class="progress-bar-orange h-full" style="width: {progress}%"></div>
	</div>

	<!-- Access until date -->
	<p class="text-center text-xs text-text-muted">
		{tx('subscription.cancelling.countdown.accessUntil', { date: '' })}<span
			class="font-semibold text-brand-orange">{formattedDate()}</span
		>
	</p>
</div>

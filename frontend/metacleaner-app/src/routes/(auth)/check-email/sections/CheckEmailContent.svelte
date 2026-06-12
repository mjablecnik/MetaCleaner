<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		email: string;
	}

	let { email }: Props = $props();

	let countdown = $state(86387);
	let resendLoading = $state(false);
	let showToast = $state(false);

	const progressPct = $derived((countdown / 86400) * 100);
	const progressColor = $derived(
		progressPct > 50 ? 'var(--color-brand-green)' : progressPct > 20 ? 'var(--color-brand-orange)' : 'var(--color-brand-red)'
	);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function formatTime(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const min = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	onMount(() => {
		const interval = setInterval(() => {
			if (countdown > 0) countdown--;
		}, 1000);
		return () => clearInterval(interval);
	});

	function resendEmail() {
		if (resendLoading) return;
		resendLoading = true;
		setTimeout(() => {
			resendLoading = false;
			showToast = true;
			setTimeout(() => { showToast = false; }, 3000);
		}, 1500);
	}
</script>

<!-- Mobile: badge + floating icon + heading -->
<div class="flex flex-col items-center gap-3 text-center lg:hidden">
	<div class="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5">
		<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
		<span class="text-xs font-semibold text-brand-green">{tx('auth.checkEmail.badge.created')}</span>
	</div>
	<div class="email-float relative mt-2">
		<div class="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-green/20 bg-brand-green/10">
			<i class="fa-regular fa-envelope text-4xl text-brand-green"></i>
		</div>
		<div class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green shadow-glow-green">
			<i class="fa-solid fa-paper-plane text-xs text-white"></i>
		</div>
	</div>
	<div>
		<h1 class="text-2xl font-black leading-tight text-white">{tx('auth.checkEmail.card.title')}</h1>
		<p class="mt-1.5 text-sm text-text-muted">{tx('auth.checkEmail.card.sentTo')}</p>
		<div class="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-2">
			<i class="fa-regular fa-envelope text-xs text-brand-blue"></i>
			<span class="text-sm font-semibold text-white">{email}</span>
		</div>
	</div>
</div>

<!-- Mobile: horizontal steps row -->
<div class="flex items-center justify-between gap-2 rounded-xl border border-gray-800 bg-navy-card p-4 lg:hidden">
	<div class="flex flex-1 flex-col items-center gap-1.5">
		<div class="step-done flex h-8 w-8 items-center justify-center rounded-full">
			<i class="fa-solid fa-check text-xs text-white"></i>
		</div>
		<p class="text-center text-xs font-medium leading-tight text-white">{tx('auth.checkEmail.mobile.stepCreated')}</p>
	</div>
	<div class="mb-5 h-px flex-1 bg-brand-green/30"></div>
	<div class="flex flex-1 flex-col items-center gap-1.5">
		<div class="pulse-ring step-active flex h-8 w-8 items-center justify-center rounded-full">
			<i class="fa-regular fa-envelope text-xs text-white"></i>
		</div>
		<p class="text-center text-xs font-medium leading-tight text-white">{tx('auth.checkEmail.mobile.stepVerify')}</p>
	</div>
	<div class="mb-5 h-px flex-1 bg-gray-700"></div>
	<div class="flex flex-1 flex-col items-center gap-1.5">
		<div class="step-pending flex h-8 w-8 items-center justify-center rounded-full">
			<i class="fa-solid fa-rocket text-xs text-text-muted"></i>
		</div>
		<p class="text-center text-xs font-medium leading-tight text-text-muted">{tx('auth.checkEmail.mobile.stepStart')}</p>
	</div>
</div>

<!-- Main card wrapper -->
<div class="flex flex-col gap-4 lg:gap-6 lg:rounded-2xl lg:border lg:border-gray-800 lg:bg-navy-card lg:p-8 lg:shadow-card">

	<!-- Desktop: email icon + heading -->
	<div class="hidden flex-col items-center gap-4 py-4 lg:flex">
		<div class="email-float relative">
			<div class="flex h-24 w-24 items-center justify-center rounded-2xl border border-brand-green/20 bg-brand-green/10">
				<i class="fa-regular fa-envelope text-5xl text-brand-green"></i>
			</div>
			<div class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-green shadow-glow-green">
				<i class="fa-solid fa-paper-plane text-xs text-white"></i>
			</div>
		</div>
		<div class="text-center">
			<h2 class="text-2xl font-bold text-white">{tx('auth.checkEmail.card.title')}</h2>
			<p class="mt-1.5 text-sm text-text-muted">{tx('auth.checkEmail.card.sentTo')}</p>
			<div class="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-1.5">
				<i class="fa-regular fa-envelope text-xs text-brand-blue"></i>
				<span class="text-sm font-semibold text-white">{email}</span>
			</div>
		</div>
	</div>

	<div class="hidden items-center gap-3 lg:flex">
		<div class="h-px flex-1 bg-navy-lighter"></div>
		<span class="whitespace-nowrap text-xs font-medium text-text-muted">{tx('auth.checkEmail.divider.waiting')}</span>
		<div class="h-px flex-1 bg-navy-lighter"></div>
	</div>

	<!-- Waiting section -->
	<div class="flex flex-col gap-4 rounded-xl border border-gray-800 bg-navy-card p-4 lg:rounded-none lg:border-none lg:bg-transparent lg:p-0">
		<div class="flex items-center gap-3 lg:gap-4 lg:rounded-xl lg:border lg:border-gray-800 lg:bg-navy-main lg:p-4">
			<div class="flex flex-shrink-0 gap-1.5">
				<div class="dot-bounce h-2.5 w-2.5 rounded-full bg-brand-blue"></div>
				<div class="dot-bounce h-2.5 w-2.5 rounded-full bg-brand-blue"></div>
				<div class="dot-bounce h-2.5 w-2.5 rounded-full bg-brand-blue"></div>
			</div>
			<div>
				<p class="text-sm font-semibold text-white">{tx('auth.checkEmail.waiting.title')}</p>
				<p class="mt-0.5 text-xs text-text-muted">{tx('auth.checkEmail.waiting.autoRefresh')}</p>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-xs text-text-muted">{tx('auth.checkEmail.progress.linkValidity')}</span>
				<span class="text-xs font-semibold tabular-nums text-white">{formatTime(countdown)}</span>
			</div>
			<div class="h-1.5 w-full overflow-hidden rounded-full bg-navy-main">
				<div class="h-full rounded-full transition-[width,background-color] duration-1000" style="width: {progressPct}%; background-color: {progressColor};"></div>
			</div>
			<p class="text-xs text-text-muted">{tx('auth.checkEmail.progress.expiresIn24h')}</p>
		</div>
	</div>

	<div class="hidden items-center gap-3 lg:flex">
		<div class="h-px flex-1 bg-navy-lighter"></div>
		<span class="whitespace-nowrap text-xs font-medium text-text-muted">{tx('auth.checkEmail.divider.or')}</span>
		<div class="h-px flex-1 bg-navy-lighter"></div>
	</div>

	<div class="flex flex-col gap-3">
		<button
			onclick={resendEmail}
			disabled={resendLoading}
			class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-60 lg:min-h-0"
		>
			{#if resendLoading}
				<i class="fa-solid fa-spinner fa-spin"></i> {tx('auth.checkEmail.resend.loading')}
			{:else}
				<i class="fa-solid fa-rotate-right"></i> {tx('auth.checkEmail.resend.idle')}
			{/if}
		</button>
		<a href="/register" class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-text-muted transition-colors hover:text-white lg:min-h-0">
			<i class="fa-regular fa-pen-to-square"></i>
			{tx('auth.checkEmail.changeEmail')}
		</a>
	</div>

	<!-- Mobile: tips inside card -->
	<div class="flex flex-col gap-2.5 rounded-xl border border-gray-800 bg-navy-main p-4 lg:hidden">
		<p class="flex items-center gap-2 text-xs font-semibold text-white">
			<i class="fa-solid fa-lightbulb text-brand-orange"></i> {tx('auth.checkEmail.tips.title')}
		</p>
		<p class="text-xs text-text-muted">
			{tx('auth.checkEmail.tips.checkFolder')} <span class="font-medium text-white">{tx('auth.checkEmail.tips.spam')}</span> {tx('auth.checkEmail.divider.or')}
			<span class="font-medium text-white">{tx('auth.checkEmail.tips.bulk')}</span>. {tx('auth.checkEmail.tips.validFor')}
			<span class="font-medium text-white">{tx('auth.checkEmail.tips.validTime')}</span>.
		</p>
	</div>
</div>

<!-- Trust badges -->
<div class="mt-4 flex flex-wrap items-center justify-center gap-4 lg:mt-5 lg:gap-5">
	<div class="flex items-center gap-1.5 text-xs text-text-muted">
		<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
		<span>{tx('auth.common.trust.ssl')}</span>
	</div>
	<div class="h-3 w-px bg-gray-700"></div>
	<div class="flex items-center gap-1.5 text-xs text-text-muted">
		<i class="fa-solid fa-user-shield text-sm text-brand-blue"></i>
		<span>{tx('auth.common.trust.gdpr')}</span>
	</div>
	<div class="h-3 w-px bg-gray-700"></div>
	<div class="flex items-center gap-1.5 text-xs text-text-muted">
		<i class="fa-solid fa-lock text-sm text-text-muted"></i>
		<span>{tx('auth.common.trust.noTracking')}</span>
	</div>
</div>

{#if showToast}
	<div class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-xl border border-brand-green/30 bg-navy-card px-5 py-3 shadow-card">
		<i class="fa-solid fa-circle-check text-brand-green"></i>
		<span class="text-sm font-medium text-white">{tx('auth.checkEmail.toast.resent')}</span>
	</div>
{/if}

<style>
	.email-float {
		animation: emailFloat 3s ease-in-out infinite;
	}
	@keyframes emailFloat {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-8px); }
	}

	.dot-bounce {
		animation: dotBounce 1.4s infinite ease-in-out;
	}
	:global(.dot-bounce:nth-child(2)) { animation-delay: 0.2s; }
	:global(.dot-bounce:nth-child(3)) { animation-delay: 0.4s; }
	@keyframes dotBounce {
		0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
		40% { transform: scale(1); opacity: 1; }
	}

	.pulse-ring {
		animation: pulseRing 2s ease-in-out infinite;
	}
	@keyframes pulseRing {
		0%, 100% { box-shadow: 0 0 0 0 var(--color-brand-green-40), 0 0 24px var(--color-brand-green-20); }
		50% { box-shadow: 0 0 0 16px transparent, 0 0 40px var(--color-brand-green-30); }
	}

	.step-done { background: var(--color-brand-green); border-color: var(--color-brand-green); }
	.step-active { background: var(--color-brand-blue); border-color: var(--color-brand-blue); }
	.step-pending { background: var(--color-navy-lighter); border-color: var(--color-gray-700); }
</style>

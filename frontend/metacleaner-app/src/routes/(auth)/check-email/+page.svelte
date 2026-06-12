<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { getAuthStats } from '$lib/repositories/authRepository';
	import AuthLayout from '../components/AuthLayout.svelte';
	import AuthNavbar from '../components/AuthNavbar.svelte';
	import CheckEmailContent from './sections/CheckEmailContent.svelte';

	const userEmail = 'jan.novak@email.cz';
	const stats = getAuthStats();

</script>

<svelte:head>
	<title>{tx('auth.checkEmail.meta.title')}</title>
</svelte:head>

<AuthLayout>
	<AuthNavbar
		rightText={tx('auth.register.nav.hasAccount')}
		rightHref="/login"
		rightLabel={tx('auth.common.nav.login')}
	/>

	<main class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-4 pb-8 pt-6 lg:px-6 lg:pb-16 lg:pt-0">
		<div class="fade-in grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Info Panel (desktop only) -->
			<div class="hidden flex-col gap-8 lg:flex">
				<div class="flex flex-col gap-4">
					<div class="inline-flex w-fit items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5">
						<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
						<span class="text-xs font-semibold text-brand-green">{tx('auth.checkEmail.badge.created')}</span>
					</div>
					<h1 class="text-4xl font-black leading-tight text-white">
						{tx('auth.checkEmail.heading.almostDone')}<br />{tx('auth.checkEmail.heading.verify')} <span class="text-brand-green">{tx('auth.checkEmail.heading.emailHighlight')}</span>
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">{tx('auth.checkEmail.heading.description')}</p>
				</div>

				<div class="flex flex-col gap-0">
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div class="step-done flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
								<i class="fa-solid fa-check text-xs text-white"></i>
							</div>
							<div class="mt-1 h-10 w-px bg-brand-green/30"></div>
						</div>
						<div class="pt-1">
							<p class="text-sm font-semibold text-white">{tx('auth.checkEmail.step.accountCreated')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.checkEmail.step.accountCreatedDesc')}</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div class="pulse-ring step-active flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
								<i class="fa-regular fa-envelope text-xs text-white"></i>
							</div>
							<div class="mt-1 h-10 w-px bg-gray-700"></div>
						</div>
						<div class="pt-1">
							<p class="text-sm font-semibold text-white">
								{tx('auth.checkEmail.step.verifyEmail')}
								<span class="ml-1 rounded bg-brand-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-blue">{tx('auth.checkEmail.step.currentStep')}</span>
							</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.checkEmail.step.clickLink')}</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div class="step-pending flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
								<i class="fa-solid fa-rocket text-xs text-text-muted"></i>
							</div>
						</div>
						<div class="pt-1">
							<p class="text-sm font-semibold text-text-muted">{tx('auth.checkEmail.step.startUsing')}</p>
							<p class="mt-0.5 text-xs text-text-muted">{tx('auth.checkEmail.step.fullAccess')}</p>
						</div>
					</div>
				</div>

				<div class="flex flex-col gap-3 rounded-xl border border-gray-800 bg-navy-card p-5">
					<p class="flex items-center gap-2 text-sm font-semibold text-white">
						<i class="fa-solid fa-lightbulb text-sm text-brand-orange"></i> {tx('auth.checkEmail.tips.title')}
					</p>
					<div class="flex flex-col gap-2">
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-folder mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
							<p class="text-xs text-text-muted">
								{tx('auth.checkEmail.tips.checkFolder')} <span class="font-medium text-white">{tx('auth.checkEmail.tips.spam')}</span> {tx('auth.checkEmail.divider.or')}
								<span class="font-medium text-white">{tx('auth.checkEmail.tips.bulk')}</span>
							</p>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-clock mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
							<p class="text-xs text-text-muted">
								{tx('auth.checkEmail.tips.delay')} <span class="font-medium text-white">{tx('auth.checkEmail.tips.delayTime')}</span>
							</p>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
							<p class="text-xs text-text-muted">
								{tx('auth.checkEmail.tips.validFor')} <span class="font-medium text-white">{tx('auth.checkEmail.tips.validTime')}</span>
							</p>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-3 gap-4 border-t border-gray-800 pt-2">
					<div class="text-center">
						<p class="text-2xl font-black text-white">{stats[0].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx(stats[0].labelKey)}</p>
					</div>
					<div class="border-x border-gray-800 text-center">
						<p class="text-2xl font-black text-brand-green">{stats[1].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx(stats[1].labelKey)}</p>
					</div>
					<div class="text-center">
						<p class="text-2xl font-black text-brand-blue">{stats[2].value}</p>
						<p class="mt-1 text-xs text-text-muted">{tx(stats[2].labelKey)}</p>
					</div>
				</div>
			</div>

			<!-- Right: Verify area -->
			<div class="mx-auto flex w-full max-w-[480px] flex-col gap-4 lg:mx-0 lg:ml-auto lg:gap-0">
				<CheckEmailContent email={userEmail} />
			</div>
		</div>
	</main>
</AuthLayout>

<style>
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.fade-in { animation: fadeIn 0.6s ease-out forwards; }

	.pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
	@keyframes pulseRing {
		0%, 100% { box-shadow: 0 0 0 0 var(--color-brand-green-40), 0 0 24px var(--color-brand-green-20); }
		50% { box-shadow: 0 0 0 16px transparent, 0 0 40px var(--color-brand-green-30); }
	}

	.step-done { background: var(--color-brand-green); border-color: var(--color-brand-green); }
	.step-active { background: var(--color-brand-blue); border-color: var(--color-brand-blue); }
	.step-pending { background: var(--color-navy-lighter); border-color: var(--color-gray-700); }
</style>

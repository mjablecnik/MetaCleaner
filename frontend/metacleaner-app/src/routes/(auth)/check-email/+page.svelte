<script lang="ts">
	import { onMount } from 'svelte';

	const userEmail = 'jan.novak@email.cz';

	let countdown = $state(86387);
	let resendLoading = $state(false);
	let showToast = $state(false);
	let tipsOpen = $state(false);

	const progressPct = $derived((countdown / 86400) * 100);
	const progressColor = $derived(
		progressPct > 50 ? '#22c55e' : progressPct > 20 ? '#f97316' : '#ef4444'
	);

	function formatTime(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
			setTimeout(() => {
				showToast = false;
			}, 3000);
		}, 1500);
	}

	function toggleTips() {
		tipsOpen = !tipsOpen;
	}
</script>

<svelte:head>
	<title>Ověřte e-mail – MetaCleaner</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,197,94,0.06) 0%, transparent 50%);"
>
	<!-- Desktop Navbar -->
	<nav class="mx-auto hidden w-full max-w-[1100px] items-center justify-between px-6 py-6 lg:flex">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-xl"></i>
			</div>
			<span class="text-xl font-bold tracking-tight">MetaCleaner</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm text-text-muted">Již máte účet?</span>
			<a
				href="/login"
				class="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-lighter"
			>
				Přihlásit se
			</a>
		</div>
	</nav>

	<!-- Mobile Navbar (sticky) -->
	<nav
		class="sticky top-0 z-50 flex w-full items-center justify-between px-4 py-4 lg:hidden"
		style="background: rgba(10,22,40,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #1e293b;"
	>
		<div class="flex items-center gap-2.5">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue"
			>
				<i class="fa-solid fa-shield-halved text-base"></i>
			</div>
			<span class="text-lg font-bold tracking-tight">MetaCleaner</span>
		</div>
		<a
			href="/login"
			class="flex items-center rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-white"
			style="min-height: 44px;"
		>
			Přihlásit se
		</a>
	</nav>

	<!-- Main -->
	<main
		class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-4 pb-8 pt-6 lg:px-6 lg:pb-16 lg:pt-0"
	>
		<div class="fade-in grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Info Panel (desktop only) -->
			<div class="hidden flex-col gap-8 lg:flex">

				<!-- Badge + Heading -->
				<div class="flex flex-col gap-4">
					<div
						class="inline-flex w-fit items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5"
					>
						<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
						<span class="text-xs font-semibold text-brand-green">Účet byl vytvořen · Poslední krok</span>
					</div>
					<h1 class="text-4xl font-black leading-tight text-white">
						Skoro hotovo!<br />Ověřte svůj <span class="text-brand-green">e-mail</span>
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">
						Poslali jsme vám ověřovací odkaz. Kliknutím na něj aktivujete svůj účet a získáte přístup
						ke všem funkcím MetaCleaneru.
					</p>
				</div>

				<!-- Steps timeline -->
				<div class="flex flex-col gap-0">
					<!-- Step 1: Done -->
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div
								class="step-done flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
							>
								<i class="fa-solid fa-check text-xs text-white"></i>
							</div>
							<div class="mt-1 h-10 w-px bg-brand-green/30"></div>
						</div>
						<div class="pt-1">
							<p class="text-sm font-semibold text-white">Účet vytvořen</p>
							<p class="mt-0.5 text-xs text-text-muted">Vaše údaje byly bezpečně uloženy</p>
						</div>
					</div>
					<!-- Step 2: Active -->
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div
								class="pulse-ring step-active flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
							>
								<i class="fa-regular fa-envelope text-xs text-white"></i>
							</div>
							<div class="mt-1 h-10 w-px bg-gray-700"></div>
						</div>
						<div class="pt-1">
							<p class="text-sm font-semibold text-white">
								Ověření e-mailu
								<span
									class="ml-1 rounded bg-brand-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-blue"
									>Aktuální krok</span
								>
							</p>
							<p class="mt-0.5 text-xs text-text-muted">Klikněte na odkaz v e-mailu</p>
						</div>
					</div>
					<!-- Step 3: Pending -->
					<div class="flex items-start gap-4">
						<div class="flex flex-col items-center">
							<div
								class="step-pending flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
							>
								<i class="fa-solid fa-rocket text-xs text-text-muted"></i>
							</div>
						</div>
						<div class="pt-1">
							<p class="text-sm font-semibold text-text-muted">Začít používat MetaCleaner</p>
							<p class="mt-0.5 text-xs text-text-muted">Plný přístup ke všem funkcím</p>
						</div>
					</div>
				</div>

				<!-- Tips card -->
				<div class="flex flex-col gap-3 rounded-xl border border-gray-800 bg-navy-card p-5">
					<p class="flex items-center gap-2 text-sm font-semibold text-white">
						<i class="fa-solid fa-lightbulb text-sm text-brand-orange"></i> Nenašli jste e-mail?
					</p>
					<div class="flex flex-col gap-2">
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-folder mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
							<p class="text-xs text-text-muted">
								Zkontrolujte složku <span class="font-medium text-white">Spam</span> nebo
								<span class="font-medium text-white">Hromadné e-maily</span>
							</p>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-clock mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
							<p class="text-xs text-text-muted">
								E-mail může přijít až za <span class="font-medium text-white">2–3 minuty</span>
							</p>
						</div>
						<div class="flex items-start gap-2.5">
							<i class="fa-solid fa-shield-halved mt-0.5 flex-shrink-0 text-xs text-text-muted"></i>
							<p class="text-xs text-text-muted">
								Odkaz je platný <span class="font-medium text-white">24 hodin</span>
							</p>
						</div>
					</div>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-3 gap-4 border-t border-gray-800 pt-2">
					<div class="text-center">
						<p class="text-2xl font-black text-white">50K+</p>
						<p class="mt-1 text-xs text-text-muted">Uživatelů</p>
					</div>
					<div class="border-x border-gray-800 text-center">
						<p class="text-2xl font-black text-brand-green">2M+</p>
						<p class="mt-1 text-xs text-text-muted">Souborů vyčištěno</p>
					</div>
					<div class="text-center">
						<p class="text-2xl font-black text-brand-blue">100%</p>
						<p class="mt-1 text-xs text-text-muted">Bezpečnost</p>
					</div>
				</div>
			</div>

			<!-- Right: Verify area -->
			<div class="mx-auto flex w-full max-w-[480px] flex-col gap-4 lg:mx-0 lg:ml-auto lg:gap-0">

				<!-- Mobile: badge + floating icon + heading -->
				<div class="flex flex-col items-center gap-3 text-center lg:hidden">
					<div
						class="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5"
					>
						<i class="fa-solid fa-circle-check text-xs text-brand-green"></i>
						<span class="text-xs font-semibold text-brand-green">Účet vytvořen · Poslední krok</span>
					</div>

					<!-- Email icon floating -->
					<div class="email-float relative mt-2">
						<div
							class="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-green/20 bg-brand-green/10"
						>
							<i class="fa-regular fa-envelope text-4xl text-brand-green"></i>
						</div>
						<div
							class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-green shadow-glow-green"
						>
							<i class="fa-solid fa-paper-plane text-xs text-white"></i>
						</div>
					</div>

					<div>
						<h1 class="text-2xl font-black leading-tight text-white">Zkontrolujte e-mail</h1>
						<p class="mt-1.5 text-sm text-text-muted">Poslali jsme ověřovací odkaz na</p>
						<div
							class="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-2"
						>
							<i class="fa-regular fa-envelope text-xs text-brand-blue"></i>
							<span class="text-sm font-semibold text-white">{userEmail}</span>
						</div>
					</div>
				</div>

				<!-- Mobile: horizontal steps row -->
				<div
					class="flex items-center justify-between gap-2 rounded-xl border border-gray-800 bg-navy-card p-4 lg:hidden"
				>
					<div class="flex flex-1 flex-col items-center gap-1.5">
						<div
							class="step-done flex h-8 w-8 items-center justify-center rounded-full"
						>
							<i class="fa-solid fa-check text-xs text-white"></i>
						</div>
						<p class="text-center text-xs font-medium leading-tight text-white">Účet<br />vytvořen</p>
					</div>
					<div class="mb-5 h-px flex-1 bg-brand-green/30"></div>
					<div class="flex flex-1 flex-col items-center gap-1.5">
						<div
							class="pulse-ring step-active flex h-8 w-8 items-center justify-center rounded-full"
						>
							<i class="fa-regular fa-envelope text-xs text-white"></i>
						</div>
						<p class="text-center text-xs font-medium leading-tight text-white">Ověření<br />e-mailu</p>
					</div>
					<div class="mb-5 h-px flex-1 bg-gray-700"></div>
					<div class="flex flex-1 flex-col items-center gap-1.5">
						<div
							class="step-pending flex h-8 w-8 items-center justify-center rounded-full"
						>
							<i class="fa-solid fa-rocket text-xs text-text-muted"></i>
						</div>
						<p class="text-center text-xs font-medium leading-tight text-text-muted">Spustit<br />app</p>
					</div>
				</div>

				<!-- Main card wrapper (card on desktop, transparent on mobile) -->
				<div
					class="flex flex-col gap-4 lg:gap-6 lg:rounded-2xl lg:border lg:border-gray-800 lg:bg-navy-card lg:p-8 lg:shadow-card"
				>

					<!-- Desktop: email icon + heading (hidden on mobile) -->
					<div class="hidden flex-col items-center gap-4 py-4 lg:flex">
						<div class="email-float relative">
							<div
								class="flex h-24 w-24 items-center justify-center rounded-2xl border border-brand-green/20 bg-brand-green/10"
							>
								<i class="fa-regular fa-envelope text-5xl text-brand-green"></i>
							</div>
							<div
								class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-green shadow-glow-green"
							>
								<i class="fa-solid fa-paper-plane text-xs text-white"></i>
							</div>
						</div>
						<div class="text-center">
							<h2 class="text-2xl font-bold text-white">Zkontrolujte e-mail</h2>
							<p class="mt-1.5 text-sm text-text-muted">Poslali jsme ověřovací odkaz na</p>
							<div
								class="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-lighter px-3 py-1.5"
							>
								<i class="fa-regular fa-envelope text-xs text-brand-blue"></i>
								<span class="text-sm font-semibold text-white">{userEmail}</span>
							</div>
						</div>
					</div>

					<!-- Desktop divider "čekáme na ověření" -->
					<div class="hidden items-center gap-3 lg:flex">
						<div class="h-px flex-1 bg-navy-lighter"></div>
						<span class="whitespace-nowrap text-xs font-medium text-text-muted">čekáme na ověření</span>
						<div class="h-px flex-1 bg-navy-lighter"></div>
					</div>

					<!-- Waiting section -->
					<div
						class="flex flex-col gap-4 rounded-xl border border-gray-800 bg-navy-card p-4 lg:rounded-none lg:border-none lg:bg-transparent lg:p-0"
					>
						<!-- Dots box -->
						<div
							class="flex items-center gap-3 lg:gap-4 lg:rounded-xl lg:border lg:border-gray-800 lg:bg-navy-main lg:p-4"
						>
							<div class="flex flex-shrink-0 gap-1.5">
								<div class="dot-bounce h-2.5 w-2.5 rounded-full bg-brand-blue"></div>
								<div class="dot-bounce h-2.5 w-2.5 rounded-full bg-brand-blue"></div>
								<div class="dot-bounce h-2.5 w-2.5 rounded-full bg-brand-blue"></div>
							</div>
							<div>
								<p class="text-sm font-semibold text-white">Čekáme na potvrzení</p>
								<p class="mt-0.5 text-xs text-text-muted">Tato stránka se automaticky aktualizuje</p>
							</div>
						</div>

						<!-- Progress -->
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<span class="text-xs text-text-muted">Platnost odkazu</span>
								<span class="text-xs font-semibold tabular-nums text-white"
									>{formatTime(countdown)}</span
								>
							</div>
							<div class="h-1.5 w-full overflow-hidden rounded-full bg-navy-main">
								<div
									class="h-full rounded-full transition-[width,background-color] duration-1000"
									style="width: {progressPct}%; background-color: {progressColor};"
								></div>
							</div>
							<p class="text-xs text-text-muted">Odkaz vyprší za 24 hodin</p>
						</div>
					</div>

					<!-- Desktop divider "nebo" -->
					<div class="hidden items-center gap-3 lg:flex">
						<div class="h-px flex-1 bg-navy-lighter"></div>
						<span class="whitespace-nowrap text-xs font-medium text-text-muted">nebo</span>
						<div class="h-px flex-1 bg-navy-lighter"></div>
					</div>

					<!-- Actions -->
					<div class="flex flex-col gap-3">
						<button
							onclick={resendEmail}
							disabled={resendLoading}
							class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-60 lg:min-h-0"
						>
							{#if resendLoading}
								<i class="fa-solid fa-spinner fa-spin"></i> Odesílám...
							{:else}
								<i class="fa-solid fa-rotate-right"></i> Znovu odeslat e-mail
							{/if}
						</button>
						<a
							href="/register"
							class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-text-muted transition-colors hover:text-white lg:min-h-0"
						>
							<i class="fa-regular fa-pen-to-square"></i>
							Změnit e-mailovou adresu
						</a>
					</div>

					<!-- Mobile: simple tips inside card (hidden on desktop) -->
					<div
						class="flex flex-col gap-2.5 rounded-xl border border-gray-800 bg-navy-main p-4 lg:hidden"
					>
						<p class="flex items-center gap-2 text-xs font-semibold text-white">
							<i class="fa-solid fa-lightbulb text-brand-orange"></i> Nenašli jste e-mail?
						</p>
						<p class="text-xs text-text-muted">
							Zkontrolujte složku <span class="font-medium text-white">Spam</span> nebo
							<span class="font-medium text-white">Hromadné e-maily</span>. Odkaz je platný
							<span class="font-medium text-white">24 hodin</span>.
						</p>
					</div>
				</div>

				<!-- Trust badges -->
				<div class="mt-4 flex flex-wrap items-center justify-center gap-4 lg:mt-5 lg:gap-5">
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
						<span>SSL šifrování</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-user-shield text-sm text-brand-blue"></i>
						<span>GDPR soulad</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-lock text-sm text-text-muted"></i>
						<span>Bez sledování</span>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<!-- Toast -->
{#if showToast}
	<div
		class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-xl border border-brand-green/30 bg-navy-card px-5 py-3 shadow-card"
	>
		<i class="fa-solid fa-circle-check text-brand-green"></i>
		<span class="text-sm font-medium text-white">E-mail byl znovu odeslán!</span>
	</div>
{/if}

<style>
	.email-float {
		animation: emailFloat 3s ease-in-out infinite;
	}
	@keyframes emailFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.dot-bounce {
		animation: dotBounce 1.4s infinite ease-in-out;
	}
	:global(.dot-bounce:nth-child(2)) {
		animation-delay: 0.2s;
	}
	:global(.dot-bounce:nth-child(3)) {
		animation-delay: 0.4s;
	}
	@keyframes dotBounce {
		0%,
		80%,
		100% {
			transform: scale(0.6);
			opacity: 0.4;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.pulse-ring {
		animation: pulseRing 2s ease-in-out infinite;
	}
	@keyframes pulseRing {
		0%,
		100% {
			box-shadow:
				0 0 0 0 rgba(34, 197, 94, 0.4),
				0 0 24px rgba(34, 197, 94, 0.2);
		}
		50% {
			box-shadow:
				0 0 0 16px rgba(34, 197, 94, 0),
				0 0 40px rgba(34, 197, 94, 0.3);
		}
	}

	.fade-in {
		animation: fadeIn 0.6s ease-out forwards;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.step-done {
		background: #22c55e;
		border-color: #22c55e;
	}
	.step-active {
		background: #3b82f6;
		border-color: #3b82f6;
	}
	.step-pending {
		background: #1e293b;
		border-color: #374151;
	}
</style>

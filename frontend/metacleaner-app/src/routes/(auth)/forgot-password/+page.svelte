<script lang="ts">
	let currentStep = $state(1);
	let email = $state('');
	let emailError = $state('');
	let sentEmail = $state('');
	let otpValues = $state(['', '', '', '', '', '']);
	let otpError = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let confirmError = $state('');
	let newPasswordVisible = $state(false);
	let confirmPasswordVisible = $state(false);
	let submitState = $state<'idle' | 'loading' | 'success'>('idle');
	let countdown = $state('14:59');
	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	let progressBarVisible = $state(true);

	let otpInputs: HTMLInputElement[] = $state([]);

	function validateEmail(v: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
	}

	function goToStep(n: number) {
		currentStep = n;
		if (n !== 2 && countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	}

	function handleEmailSubmit(e: SubmitEvent) {
		e.preventDefault();
		emailError = '';
		if (!validateEmail(email)) {
			emailError = 'Zadejte platnou e-mailovou adresu.';
			return;
		}
		sentEmail = email.trim();
		goToStep(2);
		startCountdown();
		setTimeout(() => {
			if (otpInputs[0]) otpInputs[0].focus();
		}, 100);
	}

	function handleOtpSubmit(e: SubmitEvent) {
		e.preventDefault();
		otpError = '';
		const code = otpValues.join('');
		if (code.length < 6) {
			otpError = 'Zadejte celý 6místný kód.';
			return;
		}
		if (countdownInterval) clearInterval(countdownInterval);
		goToStep(3);
	}

	function resendCode() {
		otpValues = ['', '', '', '', '', ''];
		startCountdown();
		setTimeout(() => {
			if (otpInputs[0]) otpInputs[0].focus();
		}, 100);
	}

	function handleOtpInput(idx: number, e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const val = input.value.replace(/[^0-9]/g, '').slice(0, 1);
		const next = [...otpValues];
		next[idx] = val;
		otpValues = next;
		if (val && idx < 5 && otpInputs[idx + 1]) {
			otpInputs[idx + 1].focus();
		}
	}

	function handleOtpKeydown(idx: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !otpValues[idx] && idx > 0 && otpInputs[idx - 1]) {
			otpInputs[idx - 1].focus();
		}
	}

	function handleNewPasswordSubmit(e: SubmitEvent) {
		e.preventDefault();
		confirmError = '';
		if (newPassword !== confirmPassword || newPassword.length < 8) {
			confirmError = 'Hesla se neshodují nebo jsou příliš krátká.';
			return;
		}
		submitState = 'loading';
		setTimeout(() => {
			submitState = 'idle';
			progressBarVisible = false;
			goToStep(4);
		}, 1200);
	}

	function startCountdown() {
		let total = 899;
		if (countdownInterval) clearInterval(countdownInterval);
		countdown = '14:59';
		countdownInterval = setInterval(() => {
			const m = Math.floor(total / 60);
			const s = total % 60;
			countdown = m + ':' + String(s).padStart(2, '0');
			if (total <= 0) {
				clearInterval(countdownInterval!);
				countdownInterval = null;
			}
			total--;
		}, 1000);
	}

	function toggleNewPassword() {
		newPasswordVisible = !newPasswordVisible;
	}

	function toggleConfirmPassword() {
		confirmPasswordVisible = !confirmPasswordVisible;
	}

	type StrengthResult = { score: number; label: string; color: string; widthClass: string; bgClass: string };

	function getStrength(pwd: string): StrengthResult {
		const len = pwd.length >= 8;
		const upper = /[A-Z]/.test(pwd);
		const num = /[0-9]/.test(pwd);
		const long = pwd.length >= 12;
		const score = [len, upper, num, long].filter(Boolean).length;
		const labels = ['', 'Slabé', 'Průměrné', 'Dobré', 'Silné'];
		const colors = ['text-text-muted', 'text-brand-red', 'text-brand-orange', 'text-yellow-400', 'text-brand-green'];
		const widths = ['w-0', 'w-1/4', 'w-2/4', 'w-3/4', 'w-full'];
		const bgs = ['', 'bg-brand-red', 'bg-brand-orange', 'bg-yellow-400', 'bg-brand-green'];
		return { score, label: labels[score] || '', color: colors[score], widthClass: widths[score], bgClass: bgs[score] };
	}

	const strength = $derived(getStrength(newPassword));

	function reqMet(check: boolean) {
		return check
			? 'flex items-center gap-2 text-xs text-brand-green'
			: 'flex items-center gap-2 text-xs text-text-muted';
	}
	function reqIcon(check: boolean) {
		return check ? 'fa-solid fa-circle-check text-brand-green' : 'fa-solid fa-circle text-[6px]';
	}
</script>

<svelte:head>
	<title>Zapomenuté heslo – MetaCleaner</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(34,197,94,0.06) 0%, transparent 50%);"
>
	<!-- Navbar -->
	<nav class="mx-auto flex w-full max-w-[1100px] items-center justify-between px-5 py-4 lg:px-6 lg:py-6">
		<div class="flex items-center gap-2.5 lg:gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white shadow-glow-blue lg:h-10 lg:w-10"
			>
				<i class="fa-solid fa-shield-halved text-base lg:text-xl"></i>
			</div>
			<span class="text-lg font-bold tracking-tight lg:text-xl">MetaCleaner</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="hidden text-sm text-text-muted lg:inline">Vzpomněli jste si?</span>
			<a
				href="/auth/login"
				class="rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-lighter lg:px-4 lg:py-2 lg:text-sm"
			>
				Přihlásit se
			</a>
		</div>
	</nav>

	<!-- Main -->
	<main class="mx-auto flex w-full max-w-[1100px] flex-1 items-center justify-center px-5 pb-8 lg:px-6 lg:pb-16">
		<div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">

			<!-- Left: Branding (desktop only) -->
			<div class="hidden flex-col gap-8 lg:flex">
				<div class="flex flex-col gap-4">
					<div
						class="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-blue/30 bg-brand-blue/15"
						style="animation: float 3s ease-in-out infinite;"
					>
						<i class="fa-solid fa-key text-3xl text-brand-blue"></i>
					</div>
					<h1 class="text-4xl font-black leading-tight text-white">
						Obnova<br /><span class="text-brand-green">přístupu</span> k účtu
					</h1>
					<p class="max-w-md text-base leading-relaxed text-text-muted">
						Zapomenuté heslo? Nevadí. Pošleme vám bezpečný kód na váš e-mail a během chvíle budete zpět.
					</p>
				</div>

				<!-- Step Info Cards -->
				<div class="flex flex-col gap-3">
					<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/15 text-sm font-bold text-brand-blue"
						>
							1
						</div>
						<div>
							<p class="text-sm font-semibold text-white">Zadejte e-mail</p>
							<p class="mt-0.5 text-xs text-text-muted">Na váš účet odešleme ověřovací kód.</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-envelope text-brand-blue opacity-60"></i>
						</div>
					</div>
					<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-orange/15 text-sm font-bold text-brand-orange"
						>
							2
						</div>
						<div>
							<p class="text-sm font-semibold text-white">Ověřte kód</p>
							<p class="mt-0.5 text-xs text-text-muted">Zadejte 6místný kód z e-mailu.</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-shield-halved text-brand-orange opacity-60"></i>
						</div>
					</div>
					<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
						<div
							class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15 text-sm font-bold text-brand-green"
						>
							3
						</div>
						<div>
							<p class="text-sm font-semibold text-white">Nastavte nové heslo</p>
							<p class="mt-0.5 text-xs text-text-muted">Zvolte silné heslo a přihlaste se.</p>
						</div>
						<div class="ml-auto">
							<i class="fa-solid fa-lock text-brand-green opacity-60"></i>
						</div>
					</div>
				</div>

				<!-- Security Note -->
				<div
					class="flex h-[72px] items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4"
				>
					<i class="fa-solid fa-circle-check mt-0.5 text-brand-green"></i>
					<div>
						<p class="text-sm font-semibold text-white">Bezpečný proces</p>
						<p class="mt-0.5 text-xs text-text-muted">
							Odkaz vyprší za 15 minut. Vaše data jsou chráněna end-to-end šifrováním.
						</p>
					</div>
				</div>
			</div>

			<!-- Right: Form -->
			<div class="mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">

				<!-- Progress Bar -->
				{#if progressBarVisible}
					<div class="mb-5 flex items-center gap-2 lg:mb-6">
						<div class="flex flex-1 items-center gap-2">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white transition-all duration-300"
								style="background: {currentStep > 1 ? '#22c55e' : currentStep === 1 ? '#3b82f6' : '#1e293b'}; color: {currentStep < 1 ? '#94a3b8' : 'white'};"
							>
								{#if currentStep > 1}
									<i class="fa-solid fa-check text-xs"></i>
								{:else}
									1
								{/if}
							</div>
							<div class="flex-1 h-1 overflow-hidden rounded-full bg-navy-lighter">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width: {currentStep > 1 ? '100%' : '0'}; background: {currentStep > 1 ? '#22c55e' : '#3b82f6'};"
								></div>
							</div>
						</div>
						<div class="flex flex-1 items-center gap-2">
							<div
								class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
								style="background: {currentStep > 2 ? '#22c55e' : currentStep === 2 ? '#3b82f6' : '#1e293b'}; color: {currentStep < 2 ? '#94a3b8' : 'white'};"
							>
								{#if currentStep > 2}
									<i class="fa-solid fa-check text-xs"></i>
								{:else}
									2
								{/if}
							</div>
							<div class="flex-1 h-1 overflow-hidden rounded-full bg-navy-lighter">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width: {currentStep > 2 ? '100%' : '0'}; background: #3b82f6;"
								></div>
							</div>
						</div>
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
							style="background: {currentStep === 3 ? '#3b82f6' : '#1e293b'}; color: {currentStep === 3 ? 'white' : '#94a3b8'};"
						>
							3
						</div>
					</div>
				{/if}

				<!-- Form Card -->
				<div class="rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card lg:p-8">

					<!-- Step 1: Email -->
					{#if currentStep === 1}
						<form onsubmit={handleEmailSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<!-- Mobile Header -->
							<div class="flex items-center gap-3 mb-1 lg:hidden">
								<div
									class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15"
									style="animation: float 3s ease-in-out infinite;"
								>
									<i class="fa-solid fa-key text-xl text-brand-blue"></i>
								</div>
								<div>
									<h2 class="text-xl font-bold leading-tight text-white">Zapomenuté heslo</h2>
									<p class="mt-0.5 text-xs text-text-muted">Obnova přístupu k účtu</p>
								</div>
							</div>
							<!-- Desktop Header -->
							<div class="hidden flex-col gap-1 lg:flex">
								<h2 class="text-2xl font-bold text-white">Zapomenuté heslo</h2>
								<p class="text-sm text-text-muted">
									Zadejte svůj e-mail a my vám pošleme kód pro obnovu hesla.
								</p>
							</div>
							<!-- Mobile description -->
							<p class="text-sm text-text-muted lg:hidden">
								Zadejte svůj e-mail a my vám pošleme kód pro obnovu hesla.
							</p>

							<!-- Email Field -->
							<div class="flex flex-col gap-1.5">
								<label for="email-input" class="text-sm font-medium text-white">E-mailová adresa</label>
								<div class="relative">
									<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
										<i class="fa-regular fa-envelope"></i>
									</span>
									<input
										id="email-input"
										type="email"
										bind:value={email}
										placeholder="vas@email.cz"
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-4 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background:#0a1628; border-color: {emailError ? '#ef4444' : '#1e293b'};"
										onfocus={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = emailError ? '#ef4444' : '#3b82f6')}
										onblur={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = emailError ? '#ef4444' : '#1e293b')}
									/>
								</div>
								{#if emailError}
									<span class="text-[12px] text-brand-red">
										<i class="fa-solid fa-circle-exclamation mr-1"></i>{emailError}
									</span>
								{/if}
							</div>

							<!-- Submit -->
							<button
								type="submit"
								class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: #22c55e;"
							>
								<i class="fa-solid fa-paper-plane"></i> Odeslat kód
							</button>

							<!-- Mobile Steps Preview -->
							<div class="flex flex-col gap-2 mt-1 lg:hidden">
								<div class="flex items-center gap-3 rounded-xl border border-gray-800 bg-navy-main p-3">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue/15 text-xs font-bold text-brand-blue"
									>
										1
									</div>
									<div class="flex-1">
										<p class="text-xs font-semibold text-white">Zadejte e-mail</p>
										<p class="text-[11px] text-text-muted">Odešleme ověřovací kód</p>
									</div>
									<i class="fa-solid fa-envelope text-xs text-brand-blue opacity-50"></i>
								</div>
								<div class="flex items-center gap-3 rounded-xl border border-gray-800 bg-navy-main p-3">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-orange/15 text-xs font-bold text-brand-orange"
									>
										2
									</div>
									<div class="flex-1">
										<p class="text-xs font-semibold text-white">Ověřte kód</p>
										<p class="text-[11px] text-text-muted">6místný kód z e-mailu</p>
									</div>
									<i class="fa-solid fa-shield-halved text-xs text-brand-orange opacity-50"></i>
								</div>
								<div class="flex items-center gap-3 rounded-xl border border-gray-800 bg-navy-main p-3">
									<div
										class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-green/15 text-xs font-bold text-brand-green"
									>
										3
									</div>
									<div class="flex-1">
										<p class="text-xs font-semibold text-white">Nové heslo</p>
										<p class="text-[11px] text-text-muted">Zvolte silné heslo</p>
									</div>
									<i class="fa-solid fa-lock text-xs text-brand-green opacity-50"></i>
								</div>
							</div>

							<!-- Back Link -->
							<div class="mt-1 text-center">
								<a
									href="/auth/login"
									class="text-sm text-text-muted transition-colors hover:text-white"
								>
									<i class="fa-solid fa-arrow-left mr-1.5"></i>Zpět na přihlášení
								</a>
							</div>
						</form>
					{/if}

					<!-- Step 2: OTP -->
					{#if currentStep === 2}
						<form onsubmit={handleOtpSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="mb-1 flex items-center gap-3">
								<div
									class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-orange/30 bg-brand-orange/15 lg:hidden"
								>
									<i class="fa-solid fa-shield-halved text-xl text-brand-orange"></i>
								</div>
								<div class="hidden lg:block">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/15"
									>
										<i class="fa-solid fa-shield-halved text-brand-blue"></i>
									</div>
								</div>
								<div>
									<h2 class="text-xl font-bold text-white lg:text-2xl">Ověřte kód</h2>
									<p class="mt-0.5 text-xs text-text-muted lg:hidden">Krok 2 ze 3</p>
								</div>
							</div>
							<p class="text-sm text-text-muted">
								Zadejte 6místný kód odeslaný na
								<span class="break-all font-semibold text-white">{sentEmail}</span>
							</p>

							<!-- OTP Inputs -->
							<div class="mt-1 flex justify-between gap-1.5 lg:gap-2">
								{#each otpValues as val, idx}
									<input
										bind:this={otpInputs[idx]}
										type="text"
										inputmode="numeric"
										pattern="[0-9]*"
										maxlength={1}
										value={val}
										oninput={(e) => handleOtpInput(idx, e)}
										onkeydown={(e) => handleOtpKeydown(idx, e)}
										class="flex-1 rounded-[10px] border text-center font-bold text-white transition-[border-color,box-shadow] focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:rounded-[12px]"
										style="background: #0a1628; border-color: {val ? '#22c55e' : '#1e293b'}; height: 52px; font-size: 1.25rem; max-width: 52px; lg:height:60px; lg:font-size:1.5rem;"
									/>
								{/each}
							</div>

							{#if otpError}
								<span class="text-[12px] text-brand-red">
									<i class="fa-solid fa-circle-exclamation mr-1"></i>{otpError}
								</span>
							{/if}

							<!-- Countdown -->
							<div class="flex items-center justify-between text-xs text-text-muted">
								<span>Vyprší za <span class="font-semibold text-white">{countdown}</span></span>
								<button
									type="button"
									onclick={resendCode}
									class="px-1 py-2 font-semibold text-brand-blue transition-colors hover:text-blue-400"
								>
									Odeslat znovu
								</button>
							</div>

							<!-- Verify Button -->
							<button
								type="submit"
								class="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: #22c55e;"
							>
								<i class="fa-solid fa-shield-halved"></i> Ověřit kód
							</button>

							<!-- Back -->
							<div class="text-center">
								<button
									type="button"
									onclick={() => goToStep(1)}
									class="py-2 text-sm text-text-muted transition-colors hover:text-white"
								>
									<i class="fa-solid fa-arrow-left mr-1.5"></i>Zpět
								</button>
							</div>
						</form>
					{/if}

					<!-- Step 3: New Password -->
					{#if currentStep === 3}
						<form onsubmit={handleNewPasswordSubmit} class="flex flex-col gap-3.5 lg:gap-4">
							<div class="mb-1 flex items-center gap-3">
								<div
									class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-green/30 bg-brand-green/15"
								>
									<i class="fa-solid fa-lock text-xl text-brand-green"></i>
								</div>
								<div>
									<h2 class="text-xl font-bold text-white lg:text-2xl">Nové heslo</h2>
									<p class="mt-0.5 text-xs text-text-muted">Krok 3 ze 3</p>
								</div>
							</div>
							<p class="text-sm text-text-muted">Zvolte silné heslo pro váš účet.</p>

							<!-- New Password Field -->
							<div class="flex flex-col gap-1.5">
								<label for="new-password" class="text-sm font-medium text-white">Nové heslo</label>
								<div class="relative">
									<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
										<i class="fa-solid fa-lock"></i>
									</span>
									<input
										id="new-password"
										type={newPasswordVisible ? 'text' : 'password'}
										bind:value={newPassword}
										placeholder="••••••••"
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-12 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background:#0a1628; border-color:#1e293b;"
										onfocus={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = '#3b82f6')}
										onblur={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = '#1e293b')}
									/>
									<button
										type="button"
										onclick={toggleNewPassword}
										aria-label={newPasswordVisible ? 'Skrýt heslo' : 'Zobrazit heslo'}
										class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sm text-text-muted transition-colors hover:text-white"
									>
										<i class={newPasswordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
									</button>
								</div>
								<!-- Strength Bar -->
								<div class="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-lighter">
									<div
										class="h-full rounded-full transition-all duration-300 {strength.widthClass} {strength.bgClass}"
									></div>
								</div>
								{#if newPassword.length > 0}
									<p class="text-xs {strength.color}">{strength.label}</p>
								{/if}
							</div>

							<!-- Confirm Password Field -->
							<div class="flex flex-col gap-1.5">
								<label for="confirm-password" class="text-sm font-medium text-white">Potvrdit heslo</label>
								<div class="relative">
									<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
										<i class="fa-solid fa-lock"></i>
									</span>
									<input
										id="confirm-password"
										type={confirmPasswordVisible ? 'text' : 'password'}
										bind:value={confirmPassword}
										placeholder="••••••••"
										class="min-h-[44px] w-full rounded-xl border py-3.5 pl-10 pr-12 text-sm font-medium text-white transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] lg:min-h-0 lg:py-3"
										style="background:#0a1628; border-color:{confirmError ? '#ef4444' : '#1e293b'};"
										onfocus={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = confirmError ? '#ef4444' : '#3b82f6')}
										onblur={(ev) => ((ev.currentTarget as HTMLInputElement).style.borderColor = confirmError ? '#ef4444' : '#1e293b')}
									/>
									<button
										type="button"
										onclick={toggleConfirmPassword}
										aria-label={confirmPasswordVisible ? 'Skrýt heslo' : 'Zobrazit heslo'}
										class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-sm text-text-muted transition-colors hover:text-white"
									>
										<i class={confirmPasswordVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
									</button>
								</div>
								{#if confirmError}
									<span class="text-[12px] text-brand-red">
										<i class="fa-solid fa-circle-exclamation mr-1"></i>{confirmError}
									</span>
								{/if}
							</div>

							<!-- Requirements -->
							<div class="flex flex-col gap-1.5 rounded-xl border border-gray-800 bg-navy-main p-3">
								<p class="text-xs font-semibold uppercase tracking-wider text-text-muted">Požadavky na heslo</p>
								<div class="mt-1 flex flex-col gap-1">
									<div class={reqMet(newPassword.length >= 8)}>
										<i class={reqIcon(newPassword.length >= 8)}></i>Alespoň 8 znaků
									</div>
									<div class={reqMet(/[A-Z]/.test(newPassword))}>
										<i class={reqIcon(/[A-Z]/.test(newPassword))}></i>Velké písmeno
									</div>
									<div class={reqMet(/[0-9]/.test(newPassword))}>
										<i class={reqIcon(/[0-9]/.test(newPassword))}></i>Číslo
									</div>
								</div>
							</div>

							<!-- Submit -->
							<button
								type="submit"
								disabled={submitState === 'loading'}
								class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: #22c55e;"
							>
								{#if submitState === 'loading'}
									<i class="fa-solid fa-spinner fa-spin"></i> Ukládám...
								{:else}
									<i class="fa-solid fa-check"></i> Nastavit nové heslo
								{/if}
							</button>
						</form>
					{/if}

					<!-- Step 4: Success -->
					{#if currentStep === 4}
						<div class="flex flex-col items-center gap-4 py-6 text-center lg:gap-5 lg:py-6">
							<div
								class="flex h-20 w-20 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/15 lg:h-20 lg:w-20"
							>
								<i class="fa-solid fa-circle-check text-4xl text-brand-green"></i>
							</div>
							<div>
								<h2 class="text-2xl font-bold text-white">Hotovo!</h2>
								<p class="mt-2 text-sm leading-relaxed text-text-muted">
									Vaše heslo bylo úspěšně změněno.<br />Nyní se můžete přihlásit.
								</p>
							</div>
							<a
								href="/auth/login"
								class="mt-1 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500 lg:min-h-0 lg:py-3.5"
								style="background: #22c55e;"
							>
								<i class="fa-solid fa-arrow-right-to-bracket"></i> Přihlásit se
							</a>
						</div>
					{/if}
				</div>

				<!-- Trust Badges -->
				<div class="mt-4 flex items-center justify-center gap-4 lg:mt-5 lg:gap-5">
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-shield-halved text-sm text-brand-green"></i>
						<span class="hidden lg:inline">SSL šifrování</span>
						<span class="lg:hidden">SSL</span>
					</div>
					<div class="h-3 w-px bg-gray-700"></div>
					<div class="flex items-center gap-1.5 text-xs text-text-muted">
						<i class="fa-solid fa-user-shield text-sm text-brand-blue"></i>
						<span class="hidden lg:inline">GDPR soulad</span>
						<span class="lg:hidden">GDPR</span>
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

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}
</style>

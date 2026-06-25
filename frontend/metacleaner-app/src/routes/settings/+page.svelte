<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import {
		getSettingsProfile,
		getAffiliateStats,
		getApiKeys
	} from '$lib/repositories/settingsRepository';

	const profile = getSettingsProfile();
	const affiliateStats = getAffiliateStats();
	const apiKeys = getApiKeys();

	let profileOpen = $state(true);
	let passwordOpen = $state(false);
	let apiOpen = $state(false);
	let affiliateOpen = $state(false);

	let showCurrentPass = $state(false);
	let showNewPass = $state(false);
	let showConfirmPass = $state(false);
	let showApiKey = $state(false);
	let showTestKey = $state(false);

	let newPassword = $state('');

	let toastVisible = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'green' | 'red'>('green');
	let toastTimer: ReturnType<typeof setTimeout>;

	const strengthLevels = [
		{ width: '0%', color: 'transparent', label: '' },
		{ width: '25%', color: '#ef4444', label: 'settings.password.strength.weak' },
		{ width: '50%', color: '#f97316', label: 'settings.password.strength.average' },
		{ width: '75%', color: '#3b82f6', label: 'settings.password.strength.good' },
		{ width: '100%', color: '#22c55e', label: 'settings.password.strength.strong' }
	];

	const strengthScore = $derived.by(() => {
		let score = 0;
		if (newPassword.length >= 8) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;
		return score;
	});

	const strengthData = $derived(strengthLevels[strengthScore] ?? strengthLevels[0]);

	function showToast(msg: string, type: 'green' | 'red' = 'green') {
		toastMessage = msg;
		toastType = type;
		toastVisible = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastVisible = false;
		}, 3000);
	}

	function copyToClipboard(text: string, msg: string) {
		navigator.clipboard.writeText(text).catch(() => {});
		showToast(msg);
	}
</script>

<svelte:head>
	<title>{tx('settings.meta.title')}</title>
</svelte:head>

<main class="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-4 lg:px-6 lg:pt-0">
	<!-- Page Header -->
	<div
		class="fade-in-up mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-6"
	>
		<div class="flex items-center gap-3 lg:gap-4">
			<div
				class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-brand-blue/40 bg-brand-blue/10 lg:h-14 lg:w-14 lg:rounded-2xl"
			>
				<i class="fa-solid fa-gear text-xl text-brand-blue lg:text-3xl"></i>
			</div>
			<div>
				<h1 class="text-xl font-bold leading-tight text-white lg:text-3xl">
					{tx('settings.header.title')}
				</h1>
				<p class="mt-0.5 text-xs text-text-muted lg:mt-1 lg:text-sm">
					{tx('settings.header.subtitle')}
				</p>
			</div>
		</div>
		<div
			class="hidden items-center gap-2 rounded-xl border border-gray-800 bg-navy-card px-4 py-2.5 text-xs text-text-muted sm:flex"
		>
			<i class="fa-solid fa-clock text-xs text-brand-blue"></i>
			<span
				>{tx('settings.header.lastLogin')} <span class="font-semibold text-white"
					>{profile.lastLogin}</span
				></span
			>
		</div>
	</div>

	<!-- Two column grid -->
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
		<!-- LEFT COLUMN -->
		<div class="flex flex-col gap-4 lg:gap-6">
			<!-- Account Info Card -->
			<div
				class="fade-in-up delay-2 overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card"
			>
				<button
					type="button"
					class="acc-header w-full px-5 py-4 text-left lg:px-6"
					onclick={() => (profileOpen = !profileOpen)}
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10"
						>
							<i class="fa-solid fa-circle-user text-sm text-brand-blue"></i>
						</div>
						<div class="flex-1">
							<h3 class="text-sm font-semibold text-white lg:text-base">
								{tx('settings.account.title')}
							</h3>
							<p class="text-[11px] text-text-muted">{tx('settings.account.subtitle')}</p>
						</div>
						<i
							class="acc-chevron fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
							class:rotate-180={profileOpen}
						></i>
					</div>
				</button>
				<div
					class="acc-content gap-4 border-t border-gray-800 px-5 pb-5 pt-4 lg:px-6 lg:py-5"
					class:open={profileOpen}
				>
					<!-- Avatar row -->
					<div class="flex items-center gap-4">
						<div class="relative flex-shrink-0">
							<img
								src={profile.avatarUrl}
								alt={profile.name}
								class="h-16 w-16 rounded-2xl border-2 border-brand-blue/40 object-cover"
							/>
							<button
								type="button"
								class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-navy-main bg-brand-blue"
							>
								<i class="fa-solid fa-pen text-[9px] text-white"></i>
							</button>
						</div>
						<div>
							<p class="text-sm font-bold text-white lg:text-base">{profile.name}</p>
							<p class="text-xs text-text-muted">{profile.email}</p>
							<div class="mt-1.5 flex items-center gap-1.5 lg:gap-2">
								<span
									class="rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-green"
									>{tx('settings.account.proBadge')}</span
								>
								<span
									class="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-blue"
									>{tx('settings.account.verifiedBadge')}</span
								>
							</div>
						</div>
					</div>
					<!-- Form fields -->
					<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
								>{tx('settings.account.nameLabel')}</label
							>
							<input
								type="text"
								value={profile.name}
								class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
								>{tx('settings.account.emailLabel')}</label
							>
							<input
								type="email"
								value={profile.email}
								class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
							/>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
							>{tx('settings.account.companyLabel')}</label
						>
						<input
							type="text"
							placeholder={tx('settings.account.companyPlaceholder')}
							class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
						/>
					</div>
					<button
						type="button"
						onclick={() => showToast(tx('settings.account.saveSuccess'))}
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-bold text-white shadow-glow-blue transition-all hover:bg-blue-400 active:scale-95 lg:py-2.5"
					>
						<i class="fa-solid fa-floppy-disk"></i>
						{tx('settings.account.saveButton')}
					</button>
				</div>
			</div>

			<!-- Password Card -->
			<div
				class="fade-in-up delay-3 overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card"
			>
				<button
					type="button"
					class="acc-header w-full px-5 py-4 text-left lg:px-6"
					onclick={() => (passwordOpen = !passwordOpen)}
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10"
						>
							<i class="fa-solid fa-lock text-sm text-brand-blue"></i>
						</div>
						<div class="flex-1">
							<h3 class="text-sm font-semibold text-white lg:text-base">
								{tx('settings.password.title')}
							</h3>
							<p class="text-[11px] text-text-muted">{tx('settings.password.subtitle')}</p>
						</div>
						<i
							class="acc-chevron fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
							class:rotate-180={passwordOpen}
						></i>
					</div>
				</button>
				<div
					class="acc-content gap-4 border-t border-gray-800 px-5 pb-5 pt-4 lg:px-6 lg:py-5"
					class:open={passwordOpen}
				>
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
							>{tx('settings.password.currentLabel')}</label
						>
						<div class="relative">
							<input
								type={showCurrentPass ? 'text' : 'password'}
								placeholder="••••••••••••"
								class="w-full rounded-xl border border-gray-700 bg-navy-main px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
							/>
							<button
								type="button"
								onclick={() => (showCurrentPass = !showCurrentPass)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-white"
							>
								<i
									class="fa-solid text-xs {showCurrentPass ? 'fa-eye-slash' : 'fa-eye'}"
								></i>
							</button>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
							>{tx('settings.password.newLabel')}</label
						>
						<div class="relative">
							<input
								type={showNewPass ? 'text' : 'password'}
								placeholder="••••••••••••"
								bind:value={newPassword}
								class="w-full rounded-xl border border-gray-700 bg-navy-main px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
							/>
							<button
								type="button"
								onclick={() => (showNewPass = !showNewPass)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-white"
							>
								<i class="fa-solid text-xs {showNewPass ? 'fa-eye-slash' : 'fa-eye'}"></i>
							</button>
						</div>
						<div class="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-main">
							<div
								class="h-full rounded-full transition-all duration-300"
								style:width={strengthData.width}
								style:background-color={strengthData.color}
							></div>
						</div>
						{#if strengthData.label}
							<p class="text-[10px] text-text-muted">{tx(strengthData.label)}</p>
						{/if}
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
							>{tx('settings.password.confirmLabel')}</label
						>
						<div class="relative">
							<input
								type={showConfirmPass ? 'text' : 'password'}
								placeholder="••••••••••••"
								class="w-full rounded-xl border border-gray-700 bg-navy-main px-4 py-3 pr-10 text-sm text-white placeholder-gray-600 transition-colors focus:border-brand-blue focus:outline-none lg:py-2.5"
							/>
							<button
								type="button"
								onclick={() => (showConfirmPass = !showConfirmPass)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-white"
							>
								<i
									class="fa-solid text-xs {showConfirmPass ? 'fa-eye-slash' : 'fa-eye'}"
								></i>
							</button>
						</div>
					</div>
					<button
						type="button"
						onclick={() => showToast(tx('settings.password.saveSuccess'))}
						class="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400 active:scale-95 lg:py-2.5"
					>
						<i class="fa-solid fa-check"></i>
						{tx('settings.password.saveButton')}
					</button>
				</div>
			</div>

			<!-- Affiliate Card -->
			<div
				class="fade-in-up delay-4 overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card"
			>
				<button
					type="button"
					class="acc-header w-full px-5 py-4 text-left lg:px-6"
					onclick={() => (affiliateOpen = !affiliateOpen)}
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-orange/20 bg-brand-orange/10"
						>
							<i class="fa-solid fa-users text-sm text-brand-orange"></i>
						</div>
						<div class="flex-1">
							<h3 class="text-sm font-semibold text-white lg:text-base">
								{tx('settings.affiliate.title')}
							</h3>
							<p class="text-[11px] text-text-muted">{tx('settings.affiliate.subtitle')}</p>
						</div>
						<span
							class="mr-1 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-orange lg:ml-auto lg:mr-0"
							>{tx('settings.affiliate.activeBadge')}</span
						>
						<i
							class="acc-chevron fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
							class:rotate-180={affiliateOpen}
						></i>
					</div>
				</button>
				<div
					class="acc-content gap-4 border-t border-gray-800 px-5 pb-5 pt-4 lg:px-6 lg:py-5"
					class:open={affiliateOpen}
				>
					<div class="grid grid-cols-3 gap-2 lg:gap-3">
						<div class="rounded-xl border border-gray-800 bg-navy-main p-3 text-center">
							<p class="text-2xl font-black text-brand-orange">{affiliateStats.referrals}</p>
							<p class="mt-0.5 text-[10px] text-text-muted">
								{tx('settings.affiliate.referralsLabel')}
							</p>
						</div>
						<div class="rounded-xl border border-gray-800 bg-navy-main p-3 text-center">
							<p class="text-2xl font-black text-brand-green">{affiliateStats.conversions}</p>
							<p class="mt-0.5 text-[10px] text-text-muted">
								{tx('settings.affiliate.conversionsLabel')}
							</p>
						</div>
						<div class="rounded-xl border border-gray-800 bg-navy-main p-3 text-center">
							<p class="text-2xl font-black text-white">{affiliateStats.earnings}</p>
							<p class="mt-0.5 text-[10px] text-text-muted">
								{tx('settings.affiliate.earningsLabel')}
							</p>
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-xs font-semibold uppercase tracking-wider text-text-muted"
							>{tx('settings.affiliate.linkLabel')}</label
						>
						<div class="flex gap-2">
							<input
								type="text"
								readonly
								value={affiliateStats.affiliateLink}
								class="min-w-0 flex-1 rounded-xl border border-gray-700 bg-navy-main px-3 py-2.5 font-mono text-sm text-text-muted focus:outline-none lg:px-4"
							/>
							<button
								type="button"
								onclick={() =>
									copyToClipboard(
										affiliateStats.affiliateLink,
										tx('settings.affiliate.linkCopied')
									)}
								class="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-2.5 text-sm font-bold text-brand-orange transition-colors hover:bg-brand-orange/20"
							>
								<i class="fa-solid fa-copy text-xs"></i>
								{tx('settings.affiliate.copyButton')}
							</button>
						</div>
					</div>
					<div
						class="flex items-start gap-3 rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-3"
					>
						<i
							class="fa-solid fa-circle-info mt-0.5 flex-shrink-0 text-sm text-brand-orange"
						></i>
						<p class="text-xs leading-relaxed text-text-muted">
							{tx('settings.affiliate.commissionInfoPre')} <span
								class="font-semibold text-brand-orange">{tx('settings.affiliate.commissionRate')}</span
							> {tx('settings.affiliate.commissionInfoPost')}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- RIGHT COLUMN -->
		<div class="flex flex-col gap-4 lg:gap-6">
			<!-- API Keys Card -->
			<div
				class="fade-in-up delay-2 overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card"
			>
				<button
					type="button"
					class="acc-header w-full px-5 py-4 text-left lg:px-6"
					onclick={() => (apiOpen = !apiOpen)}
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10"
						>
							<i class="fa-solid fa-code text-sm text-brand-green"></i>
						</div>
						<div class="flex-1">
							<h3 class="text-sm font-semibold text-white lg:text-base">
								{tx('settings.apiKeys.title')}
							</h3>
							<p class="text-[11px] text-text-muted">{tx('settings.apiKeys.subtitle')}</p>
						</div>
						<i
							class="acc-chevron fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
							class:rotate-180={apiOpen}
						></i>
					</div>
				</button>
				<div
					class="acc-content gap-4 border-t border-gray-800 px-5 pb-5 pt-4 lg:px-6 lg:py-5"
					class:open={apiOpen}
				>
					<!-- Production Key -->
					<div class="flex flex-col gap-3 rounded-xl border border-gray-800 bg-navy-main p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 animate-pulse rounded-full bg-brand-green"></div>
								<span class="text-xs font-semibold text-white"
									>{tx('settings.apiKeys.productionLabel')}</span
								>
							</div>
							<span
								class="rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-green"
								>{tx('settings.apiKeys.activeBadge')}</span
							>
						</div>
						<div class="flex gap-2">
							<input
								type={showApiKey ? 'text' : 'password'}
								readonly
								value={apiKeys.production.key}
								class="min-w-0 flex-1 rounded-lg border border-gray-700 bg-navy-card px-3 py-2 font-mono text-xs text-text-muted focus:outline-none"
							/>
							<button
								type="button"
								onclick={() => (showApiKey = !showApiKey)}
								class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-text-muted transition-colors hover:text-white lg:h-9 lg:w-9"
							>
								<i class="fa-solid text-xs {showApiKey ? 'fa-eye-slash' : 'fa-eye'}"></i>
							</button>
							<button
								type="button"
								onclick={() =>
									copyToClipboard(apiKeys.production.key, tx('settings.apiKeys.keyCopied'))}
								class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10 text-brand-blue transition-colors hover:bg-brand-blue/20 lg:h-9 lg:w-9"
							>
								<i class="fa-solid fa-copy text-xs"></i>
							</button>
						</div>
						<p class="text-[10px] text-text-muted">
							{tx('settings.apiKeys.createdUsed', {
								createdAt: apiKeys.production.createdAt,
								lastUsed: apiKeys.production.lastUsed
							})}
						</p>
					</div>
					<!-- Test Key -->
					<div
						class="flex flex-col gap-3 rounded-xl border border-dashed border-gray-700 bg-navy-main p-4"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-gray-600"></div>
								<span class="text-xs font-semibold text-text-muted"
									>{tx('settings.apiKeys.testLabel')}</span
								>
							</div>
							<span
								class="rounded-full border border-gray-600 bg-gray-700/50 px-2 py-0.5 text-[9px] font-bold uppercase text-text-muted"
								>{tx('settings.apiKeys.sandboxBadge')}</span
							>
						</div>
						<div class="flex gap-2">
							<input
								type={showTestKey ? 'text' : 'password'}
								readonly
								value={apiKeys.test.key}
								class="min-w-0 flex-1 rounded-lg border border-gray-700 bg-navy-card px-3 py-2 font-mono text-xs text-text-muted focus:outline-none"
							/>
							<button
								type="button"
								onclick={() => (showTestKey = !showTestKey)}
								class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-navy-lighter text-text-muted transition-colors hover:text-white lg:h-9 lg:w-9"
							>
								<i class="fa-solid text-xs {showTestKey ? 'fa-eye-slash' : 'fa-eye'}"></i>
							</button>
							<button
								type="button"
								onclick={() =>
									copyToClipboard(apiKeys.test.key, tx('settings.apiKeys.testKeyCopied'))}
								class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10 text-brand-blue transition-colors hover:bg-brand-blue/20 lg:h-9 lg:w-9"
							>
								<i class="fa-solid fa-copy text-xs"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<!-- Toast desktop (bottom-right) -->
<div class="settings-toast-desktop" class:show={toastVisible} class:red={toastType === 'red'}>
	<i
		class="fa-solid text-sm {toastType === 'red'
			? 'fa-xmark text-brand-red'
			: 'fa-check text-brand-green'}"
	></i>
	<span class="text-sm font-semibold text-white">{toastMessage}</span>
</div>

<!-- Toast mobile (bottom-center) -->
<div class="settings-toast-mobile" class:show={toastVisible} class:red={toastType === 'red'}>
	<i
		class="fa-solid text-sm {toastType === 'red'
			? 'fa-xmark text-brand-red'
			: 'fa-check text-brand-green'}"
	></i>
	<span class="text-sm font-semibold text-white">{toastMessage}</span>
</div>

<style>
	/* Accordion: hidden by default on mobile, always shown on desktop */
	.acc-content {
		display: none;
		flex-direction: column;
	}
	.acc-content.open {
		display: flex;
	}
	@media (min-width: 1024px) {
		.acc-content {
			display: flex !important;
		}
		.acc-chevron {
			display: none;
		}
		.acc-header {
			cursor: default;
			pointer-events: none;
		}
	}

	/* Toast — desktop (bottom-right) */
	.settings-toast-desktop {
		display: none;
		position: fixed;
		bottom: 32px;
		right: 32px;
		z-index: 999;
		background: var(--color-navy-card);
		border: 1px solid var(--color-brand-green);
		border-radius: 12px;
		padding: 14px 20px;
		align-items: center;
		gap: 12px;
		box-shadow: var(--shadow-dropdown);
		transform: translateY(100px);
		opacity: 0;
		transition: all 0.3s ease;
	}
	.settings-toast-desktop.show {
		display: flex;
		transform: translateY(0);
		opacity: 1;
	}
	.settings-toast-desktop.red {
		border-color: var(--color-brand-red);
	}

	/* Toast — mobile (bottom-center) */
	.settings-toast-mobile {
		display: none;
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%) translateY(80px);
		z-index: 999;
		background: var(--color-navy-card);
		border: 1px solid var(--color-brand-green);
		border-radius: 12px;
		padding: 12px 18px;
		align-items: center;
		gap: 10px;
		box-shadow: var(--shadow-dropdown);
		opacity: 0;
		transition: all 0.3s ease;
		white-space: nowrap;
	}
	.settings-toast-mobile.show {
		display: flex;
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}
	.settings-toast-mobile.red {
		border-color: var(--color-brand-red);
	}

	@media (min-width: 1024px) {
		.settings-toast-mobile {
			display: none !important;
		}
	}
	@media (max-width: 1023px) {
		.settings-toast-desktop {
			display: none !important;
		}
	}

	/* Remove browser password reveal button */
	input[type='password']::-ms-reveal {
		display: none;
	}
</style>

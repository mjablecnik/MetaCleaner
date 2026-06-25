<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Toast from '$lib/shared/components/Toast.svelte';
	import {
		getSettingsProfile,
		getAffiliateStats,
		getApiKeys
	} from '$lib/repositories/settingsRepository';
	import SettingsHeaderSection from './sections/SettingsHeaderSection.svelte';
	import SettingsAccordionCard from './components/SettingsAccordionCard.svelte';
	import AccountInfoSection from './sections/AccountInfoSection.svelte';
	import ChangePasswordSection from './sections/ChangePasswordSection.svelte';
	import AffiliateProgramSection from './sections/AffiliateProgramSection.svelte';
	import ApiKeysSection from './sections/ApiKeysSection.svelte';

	const profile = getSettingsProfile();
	const affiliateStats = getAffiliateStats();
	const apiKeys = getApiKeys();

	let showToast = $state(false);
	let toastMessage = $state('');
	let toastTimer: ReturnType<typeof setTimeout>;

	function triggerToast(msg: string) {
		toastMessage = msg;
		showToast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	function copyToClipboard(text: string, msg: string) {
		navigator.clipboard.writeText(text).catch(() => {});
		triggerToast(msg);
	}
</script>

<svelte:head>
	<title>{tx('settings.meta.title')}</title>
</svelte:head>

<main class="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-4 lg:px-6 lg:pt-0">
	<SettingsHeaderSection lastLogin={profile.lastLogin} />

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
		<!-- LEFT COLUMN -->
		<div class="flex flex-col gap-4 lg:gap-6">
			<SettingsAccordionCard
				icon="fa-solid fa-circle-user"
				colorVariant="blue"
				title={tx('settings.account.title')}
				subtitle={tx('settings.account.subtitle')}
				defaultOpen={true}
				animationDelay="delay-2"
			>
				<AccountInfoSection {profile} onSave={() => triggerToast(tx('settings.account.saveSuccess'))} />
			</SettingsAccordionCard>

			<SettingsAccordionCard
				icon="fa-solid fa-lock"
				colorVariant="blue"
				title={tx('settings.password.title')}
				subtitle={tx('settings.password.subtitle')}
				animationDelay="delay-3"
			>
				<ChangePasswordSection onSave={() => triggerToast(tx('settings.password.saveSuccess'))} />
			</SettingsAccordionCard>

			<SettingsAccordionCard
				icon="fa-solid fa-users"
				colorVariant="orange"
				title={tx('settings.affiliate.title')}
				subtitle={tx('settings.affiliate.subtitle')}
				badge={tx('settings.affiliate.activeBadge')}
				animationDelay="delay-4"
			>
				<AffiliateProgramSection {affiliateStats} onCopy={copyToClipboard} />
			</SettingsAccordionCard>
		</div>

		<!-- RIGHT COLUMN -->
		<div class="flex flex-col gap-4 lg:gap-6">
			<SettingsAccordionCard
				icon="fa-solid fa-code"
				colorVariant="green"
				title={tx('settings.apiKeys.title')}
				subtitle={tx('settings.apiKeys.subtitle')}
				animationDelay="delay-2"
			>
				<ApiKeysSection {apiKeys} />
			</SettingsAccordionCard>
		</div>
	</div>
</main>

<Toast message={toastMessage} show={showToast} />

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import Button from '$lib/shared/elements/Button.svelte';
	import Toast from '$lib/shared/components/Toast.svelte';
	import SettingsAccordionCard from './components/SettingsAccordionCard.svelte';
	import AccountInfoSection from './sections/AccountInfoSection.svelte';
	import ChangePasswordSection from './sections/ChangePasswordSection.svelte';
	import ApiKeysSection from './sections/ApiKeysSection.svelte';
	// import DangerZoneSection from './sections/DangerZoneSection.svelte';
	import SettingsHeaderSection from './sections/SettingsHeaderSection.svelte';
	import AffiliateProgramSection from './sections/AffiliateProgramSection.svelte';
	import CreateKeyModal from './components/CreateKeyModal.svelte';
	import type { ApiKey } from '$lib/clients/apiKeysClient.js';

	let showToast = $state(false);
	let toastMessage = $state('');
	let toastTimer: ReturnType<typeof setTimeout>;

	let showCreateKeyModal = $state(false);
	let newlyCreatedKey = $state<{ key: ApiKey } | null>(null);

	function handleKeyCreated(key: ApiKey, _fullKey: string) {
		newlyCreatedKey = { key };
		showCreateKeyModal = false;
	}

	function triggerToast(msg: string) {
		toastMessage = msg;
		showToast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			showToast = false;
		}, 3000);
	}
</script>

<svelte:head>
	<title>{tx('settings.meta.title')}</title>
</svelte:head>

<main class="mx-auto w-full max-w-[1100px] px-6 pt-4 pb-24 lg:pt-0">
	<SettingsHeaderSection />
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
				{#snippet headerExtra()}
					<Badge color="green" label={tx('settings.account.proBadge')} />
					<Badge color="blue" label={tx('settings.account.verifiedBadge')} />
				{/snippet}
				<AccountInfoSection onSave={() => triggerToast(tx('settings.account.saveSuccess'))} />
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

			<!-- DangerZoneSection — temporarily hidden, will be used later -->
			<!-- <DangerZoneSection /> -->
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
				{#snippet headerExtra()}
					<Button variant="primary" size="sm" onclick={() => (showCreateKeyModal = true)}>
						<i class="fa-solid fa-plus"></i>
						{tx('apiKeys.createButton')}
					</Button>
				{/snippet}
				<ApiKeysSection bind:showCreateModal={showCreateKeyModal} addKey={newlyCreatedKey} />
			</SettingsAccordionCard>

			<SettingsAccordionCard
				icon="fa-solid fa-users"
				colorVariant="orange"
				title={tx('settings.affiliate.title')}
				subtitle={tx('settings.affiliate.subtitle')}
				badge={tx('settings.affiliate.comingSoonBadge')}
				animationDelay="delay-3"
				disabled={true}
			>
				<AffiliateProgramSection />
			</SettingsAccordionCard>
		</div>
	</div>
</main>

{#if showCreateKeyModal}
	<CreateKeyModal
		onClose={() => (showCreateKeyModal = false)}
		onCreated={handleKeyCreated}
	/>
{/if}

<Toast message={toastMessage} show={showToast} />

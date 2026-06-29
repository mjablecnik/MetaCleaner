<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { onMount } from 'svelte';
	import { listApiKeys } from '$lib/clients/apiKeysClient';
	import type { ApiKey } from '$lib/clients/apiKeysClient';
	import PageHeaderSection from './sections/PageHeaderSection.svelte';
	import UsageSummarySection from './sections/UsageSummarySection.svelte';
	import SecurityInfoSection from './sections/SecurityInfoSection.svelte';
	import KeysListSection from './sections/KeysListSection.svelte';
	import UsageGuideSection from './sections/UsageGuideSection.svelte';
	import CreateKeyModal from './components/CreateKeyModal.svelte';
	import DeleteConfirmModal from './components/DeleteConfirmModal.svelte';

	const RATE_LIMIT_RPM = 120;

	let keys = $state<ApiKey[]>([]);
	let isLoading = $state(true);
	let loadError = $state<string | null>(null);
	let showCreateModal = $state(false);
	let keyToDelete = $state<ApiKey | null>(null);
	/** Full plaintext values for newly created keys (one-time reveal) */
	let newKeyValues = $state(new Map<string, string>());

	const activeKeysCount = $derived(keys.filter((k) => k.status === 'active').length);

	function handleKeyCreated(newKey: ApiKey, fullKey: string) {
		keys = [newKey, ...keys];
		newKeyValues = new Map(newKeyValues).set(newKey.id, fullKey);
		showCreateModal = false;
	}

	function handleKeyDeleted(id: string) {
		keys = keys.filter((k) => k.id !== id);
		keyToDelete = null;
	}

	function handleKeyUpdated(updated: ApiKey) {
		keys = keys.map((k) => (k.id === updated.id ? updated : k));
	}

	async function loadKeys() {
		isLoading = true;
		loadError = null;
		try {
			keys = await listApiKeys();
		} catch {
			loadError = tx('apiKeys.error.loadFailed');
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadKeys();
	});
</script>

<svelte:head>
	<title>{tx('apiKeys.title')} — MetaCleaner</title>
</svelte:head>

<main
	class="mx-auto mt-4 flex w-full max-w-[1100px] flex-col gap-6 px-6 pb-28 lg:mt-0 lg:gap-8 lg:pb-24"
>
	<PageHeaderSection onCreateKey={() => (showCreateModal = true)} />

	{#if isLoading}
		<div class="flex items-center justify-center py-16">
			<i class="fa-solid fa-circle-notch spin-slow text-2xl text-brand-blue"></i>
		</div>
	{:else if loadError}
		<div
			class="flex flex-col items-center gap-3 rounded-xl border border-red-800/50 bg-brand-red/10 p-6 text-center"
		>
			<i class="fa-solid fa-triangle-exclamation text-xl text-brand-red"></i>
			<p class="text-sm text-brand-red">{loadError}</p>
			<button
				onclick={loadKeys}
				class="rounded-lg border border-brand-red/30 bg-brand-red/10 px-4 py-2 text-sm font-semibold text-brand-red transition-all hover:bg-brand-red/20"
			>
				{tx('apiKeys.error.retry')}
			</button>
		</div>
	{:else}
		<UsageSummarySection {activeKeysCount} rateLimit={RATE_LIMIT_RPM} />
		<SecurityInfoSection />
		<KeysListSection
			{keys}
			{newKeyValues}
			onCreateKey={() => (showCreateModal = true)}
			onDelete={(key) => (keyToDelete = key)}
			onRevoke={handleKeyUpdated}
		/>
		<UsageGuideSection />
	{/if}
</main>

<CreateKeyModal
	open={showCreateModal}
	onClose={() => (showCreateModal = false)}
	onCreated={handleKeyCreated}
/>

<DeleteConfirmModal
	apiKey={keyToDelete}
	onClose={() => (keyToDelete = null)}
	onDeleted={handleKeyDeleted}
/>

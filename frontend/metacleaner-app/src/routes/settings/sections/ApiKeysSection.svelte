<script lang="ts">
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import Button from '$lib/shared/elements/Button.svelte';
	import {
		listApiKeys,
		revokeApiKey,
		deleteApiKey,
		type ApiKey
	} from '$lib/clients/apiKeysClient.js';
	import CreateKeyModal from '../components/CreateKeyModal.svelte';
	import DeleteKeyModal from '../components/DeleteKeyModal.svelte';

	let keys = $state<ApiKey[]>([]);
	let loadLoading = $state(true);
	let loadError = $state('');

	let showCreateModal = $state(false);
	let showDeleteModal = $state(false);
	let keyToDelete = $state<ApiKey | null>(null);

	let operationError = $state('');
	let revokingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);

	async function loadKeys() {
		loadLoading = true;
		loadError = '';
		try {
			keys = await listApiKeys();
		} catch {
			loadError = tx('apiKeys.error.loadFailed');
		} finally {
			loadLoading = false;
		}
	}

	onMount(() => {
		loadKeys();
	});

	async function handleRevoke(key: ApiKey) {
		operationError = '';
		revokingId = key.id;
		try {
			const updated = await revokeApiKey(key.id);
			keys = keys.map((k) => (k.id === key.id ? updated : k));
		} catch {
			operationError = tx('apiKeys.error.revokeFailed');
		} finally {
			revokingId = null;
		}
	}

	function handleDeleteClick(key: ApiKey) {
		keyToDelete = key;
		showDeleteModal = true;
	}

	async function handleDeleteConfirm() {
		if (!keyToDelete) return;
		operationError = '';
		deletingId = keyToDelete.id;
		try {
			await deleteApiKey(keyToDelete.id);
			keys = keys.filter((k) => k.id !== keyToDelete!.id);
			showDeleteModal = false;
			keyToDelete = null;
		} catch {
			operationError = tx('apiKeys.error.deleteFailed');
		} finally {
			deletingId = null;
		}
	}

	function handleKeyCreated(key: ApiKey) {
		keys = [...keys, key];
		showCreateModal = false;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}
</script>

{#if loadLoading}
	<div class="flex items-center gap-2 py-4 text-sm text-text-muted">
		<i class="fa-solid fa-circle-notch animate-spin"></i>
		<span>{tx('common.loading')}</span>
	</div>
{:else if loadError}
	<div
		class="rounded-xl border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-sm text-brand-red"
	>
		<i class="fa-solid fa-circle-exclamation mr-2"></i>{loadError}
	</div>
	<Button variant="secondary" onclick={loadKeys}>
		<i class="fa-solid fa-rotate-right"></i>
		{tx('apiKeys.error.retry')}
	</Button>
{:else}
	<div class="flex justify-end">
		<Button variant="primary" size="sm" onclick={() => (showCreateModal = true)}>
			<i class="fa-solid fa-plus"></i>
			{tx('apiKeys.createButton')}
		</Button>
	</div>

	{#if operationError}
		<div
			class="rounded-xl border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-sm text-brand-red"
		>
			<i class="fa-solid fa-circle-exclamation mr-2"></i>{operationError}
		</div>
	{/if}

	{#if keys.length === 0}
		<div class="flex flex-col items-center gap-4 py-6 text-center">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-700 bg-navy-main"
			>
				<i class="fa-solid fa-key text-xl text-text-muted"></i>
			</div>
			<p class="text-sm text-text-muted">{tx('apiKeys.emptyState.title')}</p>
			<Button variant="primary" size="sm" onclick={() => (showCreateModal = true)}>
				<i class="fa-solid fa-plus"></i>
				{tx('apiKeys.emptyState.cta')}
			</Button>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each keys as key (key.id)}
				<div class="rounded-xl border border-gray-700 bg-navy-main px-4 py-3">
					<div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
						<div class="flex min-w-0 flex-col gap-1">
							<div class="flex items-center gap-2">
								<span class="truncate text-sm font-semibold text-white">{key.name}</span>
								<Badge
									color={key.status === 'active' ? 'green' : 'gray'}
									label={key.status === 'active'
										? tx('apiKeys.status.active')
										: tx('apiKeys.status.revoked')}
									dot={key.status === 'active'}
								/>
							</div>
							<span class="truncate font-mono text-xs text-text-muted"
								>{key.key_prefix}••••••••{key.key_suffix}</span
							>
							<span class="text-xs text-text-muted">{formatDate(key.created_at)}</span>
						</div>
						<div class="flex items-center justify-end gap-2 lg:flex-shrink-0 lg:justify-start">
							{#if key.status === 'active'}
								<Button
									variant="secondary"
									size="sm"
									disabled={revokingId === key.id}
									onclick={() => handleRevoke(key)}
								>
									{#if revokingId === key.id}
										<i class="fa-solid fa-circle-notch animate-spin"></i>
									{:else}
										<i class="fa-solid fa-ban"></i>
									{/if}
									{tx('apiKeys.action.revoke')}
								</Button>
							{/if}
							<Button
								variant="danger"
								size="sm"
								disabled={deletingId === key.id}
								onclick={() => handleDeleteClick(key)}
							>
								{#if deletingId === key.id}
									<i class="fa-solid fa-circle-notch animate-spin"></i>
								{:else}
									<i class="fa-solid fa-trash"></i>
								{/if}
								{tx('apiKeys.action.delete')}
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
{/if}

{#if showCreateModal}
	<CreateKeyModal onClose={() => (showCreateModal = false)} onCreated={handleKeyCreated} />
{/if}

{#if showDeleteModal && keyToDelete}
	<DeleteKeyModal
		keyName={keyToDelete.name}
		onClose={() => {
			showDeleteModal = false;
			keyToDelete = null;
		}}
		onConfirm={handleDeleteConfirm}
	/>
{/if}

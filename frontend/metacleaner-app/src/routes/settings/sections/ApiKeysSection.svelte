<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { tx } from '$lib/shared/utils/i18n';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import Button from '$lib/shared/elements/Button.svelte';
	import {
		listApiKeys,
		revokeApiKey,
		deleteApiKey,
		type ApiKey
	} from '$lib/clients/apiKeysClient.js';
	import DeleteKeyModal from '../components/DeleteKeyModal.svelte';

	interface Props {
		showCreateModal?: boolean;
		/** Called by parent when a key is created via the page-level modal */
		addKey?: { key: ApiKey; fullKey: string } | null;
		/** Show create button at bottom of key list (for mobile) */
		showCreateButton?: boolean;
	}

	/* eslint-disable no-useless-assignment */
	let {
		showCreateModal = $bindable(false),
		addKey = null,
		showCreateButton = false
	}: Props = $props();
	/* eslint-enable no-useless-assignment */

	let lastAddedKeyId = $state<string | null>(null);
	/** Full plaintext values for newly created keys (one-time reveal) */
	let newKeyValues = new SvelteMap<string, string>();
	/** Which keys are currently revealing their value */
	let revealedKeys = new SvelteSet<string>();
	/** Copy-success state per key */
	let copiedKeys = new SvelteSet<string>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	let copyTimers = new Map<string, ReturnType<typeof setTimeout>>();

	// React to parent passing a newly created key
	$effect(() => {
		if (addKey && addKey.key.id !== lastAddedKeyId) {
			lastAddedKeyId = addKey.key.id;
			keys = [...keys, addKey.key];
			if (addKey.fullKey) {
				newKeyValues.set(addKey.key.id, addKey.fullKey);
				// Auto-reveal new keys so users see their value immediately
				revealedKeys.add(addKey.key.id);
			}
		}
	});

	let keys = $state<ApiKey[]>([]);
	let loadLoading = $state(true);
	let loadError = $state('');

	let showDeleteModal = $state(false);
	let keyToDelete = $state<ApiKey | null>(null);

	let operationError = $state('');
	let revokingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);

	async function loadKeys() {
		loadLoading = true;
		loadError = '';
		try {
			const loaded = await listApiKeys();
			// Sort by created_at ascending (oldest first, newest last)
			keys = loaded.sort(
				(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
			);
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
			// Clean up reveal/copy state for deleted key
			newKeyValues.delete(keyToDelete.id);
			revealedKeys.delete(keyToDelete!.id);
			showDeleteModal = false;
			keyToDelete = null;
		} catch {
			operationError = tx('apiKeys.error.deleteFailed');
		} finally {
			deletingId = null;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString();
	}

	function getMaskedValue(key: ApiKey): string {
		return `${key.key_prefix}${'•'.repeat(18)}${key.key_suffix}`;
	}

	function getDisplayValue(key: ApiKey): string {
		if (revealedKeys.has(key.id)) {
			return newKeyValues.get(key.id) ?? getMaskedValue(key);
		}
		return getMaskedValue(key);
	}

	function toggleReveal(keyId: string) {
		if (revealedKeys.has(keyId)) {
			revealedKeys.delete(keyId);
		} else {
			revealedKeys.add(keyId);
		}
	}

	async function handleCopy(key: ApiKey) {
		const text = newKeyValues.get(key.id) ?? getMaskedValue(key);
		let success = false;

		if (navigator.clipboard && window.isSecureContext) {
			try {
				await navigator.clipboard.writeText(text);
				success = true;
			} catch {
				success = false;
			}
		}

		if (!success) {
			try {
				const textarea = document.createElement('textarea');
				textarea.value = text;
				textarea.style.position = 'fixed';
				textarea.style.left = '-9999px';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.select();
				success = document.execCommand('copy');
				document.body.removeChild(textarea);
			} catch {
				success = false;
			}
		}

		if (success) {
			copiedKeys.add(key.id);
			const existing = copyTimers.get(key.id);
			if (existing) clearTimeout(existing);
			copyTimers.set(
				key.id,
				setTimeout(() => {
					copiedKeys.delete(key.id);
					copyTimers.delete(key.id);
				}, 2000)
			);
		}
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
				{@const isRevealed = revealedKeys.has(key.id)}
				{@const hasFullKey = newKeyValues.has(key.id)}
				{@const isCopied = copiedKeys.has(key.id)}
				<div class="flex flex-col gap-3 rounded-xl border border-gray-800 bg-navy-main p-4">
					<!-- Header row: dot + name + status badge -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div
								class="h-2 w-2 rounded-full {key.status === 'active'
									? 'animate-pulse bg-brand-green'
									: 'bg-gray-600'}"
							></div>
							<span
								class="text-sm font-semibold {key.status === 'active'
									? 'text-white'
									: 'text-text-muted'}">{key.name}</span
							>
						</div>
						<Badge
							color={key.status === 'active' ? 'green' : 'gray'}
							label={key.status === 'active'
								? tx('apiKeys.status.active')
								: tx('apiKeys.status.revoked')}
							dot={key.status === 'active'}
							class="px-2! py-0.5! text-[8px]!"
						/>
					</div>

					<!-- Key value row + action icons -->
					<div class="flex items-center gap-2">
						<div
							class="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-700 bg-navy-card px-3 py-2"
						>
							<span class="truncate font-mono text-xs text-text-muted">
								{getDisplayValue(key)}
							</span>
						</div>
						<!-- Eye toggle: only useful when full key is available -->
						{#if hasFullKey}
							<button
								aria-label={isRevealed
									? tx('apiKeys.action.hideKey')
									: tx('apiKeys.action.showKey')}
								onclick={() => toggleReveal(key.id)}
								class="flex h-9 min-h-[44px] w-9 min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-navy-card text-text-muted transition-all hover:bg-navy-lighter hover:text-white lg:min-h-0 lg:min-w-0"
							>
								<i class="fa-solid {isRevealed ? 'fa-eye-slash' : 'fa-eye'} text-xs"></i>
							</button>
						{/if}
						<!-- Copy button -->
						<button
							aria-label={tx('apiKeys.action.copyKey')}
							onclick={() => handleCopy(key)}
							class="flex h-9 min-h-[44px] w-9 min-w-[44px] shrink-0 items-center justify-center rounded-lg border {isCopied
								? 'border-brand-green/40 bg-brand-green/10 text-brand-green'
								: 'border-gray-700 bg-navy-card text-text-muted hover:bg-navy-lighter hover:text-white'} transition-all lg:min-h-0 lg:min-w-0"
						>
							<i class="fa-solid {isCopied ? 'fa-check' : 'fa-copy'} text-xs"></i>
						</button>
						{#if key.status === 'active'}
							<button
								aria-label={tx('apiKeys.action.revoke')}
								disabled={revokingId === key.id}
								onclick={() => handleRevoke(key)}
								class="flex h-9 min-h-[44px] w-9 min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-brand-orange/25 bg-brand-orange/10 text-brand-orange transition-all hover:bg-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-0 lg:min-w-0"
							>
								{#if revokingId === key.id}
									<i class="fa-solid fa-circle-notch animate-spin text-xs"></i>
								{:else}
									<i class="fa-solid fa-ban text-xs"></i>
								{/if}
							</button>
						{/if}
						<button
							aria-label={tx('apiKeys.action.delete')}
							disabled={deletingId === key.id}
							onclick={() => handleDeleteClick(key)}
							class="flex h-9 min-h-[44px] w-9 min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-brand-red/25 bg-brand-red/10 text-brand-red transition-all hover:bg-brand-red/20 disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-0 lg:min-w-0"
						>
							{#if deletingId === key.id}
								<i class="fa-solid fa-circle-notch animate-spin text-xs"></i>
							{:else}
								<i class="fa-solid fa-trash text-xs"></i>
							{/if}
						</button>
					</div>

					<!-- Dates row -->
					<p class="text-[10px] text-text-muted">
						{tx('apiKeys.createdAt')}: {formatDate(key.created_at)}{#if key.last_used_at}
							· {tx('apiKeys.lastUsedAt')}: {formatDate(key.last_used_at)}{/if}
					</p>
				</div>
			{/each}

			{#if showCreateButton}
				<div class="mt-1 lg:hidden">
					<Button
						variant="primary"
						size="sm"
						onclick={() => (showCreateModal = true)}
						class="w-full"
					>
						<i class="fa-solid fa-plus"></i>
						{tx('apiKeys.createButton')}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
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

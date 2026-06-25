<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import { revokeApiKey, activateApiKey } from '$lib/clients/apiKeysClient';
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		apiKey: ApiKey;
		onDelete: (key: ApiKey) => void;
		onRevoke: (key: ApiKey) => void;
	}

	const { apiKey, onDelete, onRevoke }: Props = $props();

	let isRevoking = $state(false);
	let isActivating = $state(false);
	let operationError = $state<string | null>(null);

	const keyDisplayHint = $derived(`${apiKey.key_prefix}${'•'.repeat(18)}${apiKey.key_suffix}`);

	const isActive = $derived(apiKey.status === 'active');

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	async function handleRevoke() {
		if (!isActive || isRevoking) return;
		isRevoking = true;
		operationError = null;
		try {
			const updated = await revokeApiKey(apiKey.id);
			onRevoke(updated);
		} catch (e: unknown) {
			operationError = e instanceof Error ? e.message : 'Failed to revoke key';
		} finally {
			isRevoking = false;
		}
	}

	async function handleActivate() {
		if (isActive || isActivating) return;
		isActivating = true;
		operationError = null;
		try {
			const updated = await activateApiKey(apiKey.id);
			onRevoke(updated);
		} catch (e: unknown) {
			operationError = e instanceof Error ? e.message : 'Failed to activate key';
		} finally {
			isActivating = false;
		}
	}
</script>

<div
	class="flex flex-col gap-4 border-b border-gray-800/60 px-6 py-5 transition-colors last:border-b-0 hover:bg-white/[0.01] lg:flex-row lg:items-center {!isActive
		? 'opacity-50'
		: ''}"
>
	<div class="flex min-w-0 flex-1 items-center gap-3">
		<div
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border {isActive
				? 'border-brand-green/25 bg-brand-green/10'
				: 'border-gray-700 bg-gray-700/30'}"
		>
			<i class="fa-solid fa-key text-sm {isActive ? 'text-brand-green' : 'text-text-muted'}"></i>
		</div>
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2">
				<p class="text-sm font-semibold text-white">{apiKey.name}</p>
				{#if isActive}
					<Badge color="green" label={tx('apiKeys.status.active')} dot />
				{:else}
					<Badge color="red" label={tx('apiKeys.status.revoked')} />
				{/if}
			</div>
			<p class="mt-0.5 text-xs text-text-muted">
				Created {formatDate(apiKey.created_at)}
				{#if isActive && apiKey.last_used_at}
					· Last used {formatDate(apiKey.last_used_at)}
				{:else if !isActive && apiKey.revoked_at}
					· Revoked {formatDate(apiKey.revoked_at)}
				{/if}
			</p>
			{#if operationError}
				<p class="mt-1 text-xs text-brand-red">
					<i class="fa-solid fa-circle-exclamation mr-1"></i>{operationError}
				</p>
			{/if}
		</div>
	</div>
	<div class="flex flex-shrink-0 flex-wrap items-center gap-2">
		<div class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-main px-3 py-2">
			<span class="font-mono text-xs text-text-muted">
				{keyDisplayHint}
			</span>
		</div>
		{#if isActive}
			<button
				onclick={handleRevoke}
				disabled={isRevoking}
				title={tx('apiKeys.action.revoke')}
				class="rounded-lg border border-brand-orange/25 bg-brand-orange/10 p-2 text-xs text-brand-orange transition-all hover:bg-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if isRevoking}
					<i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
				{:else}
					<i class="fa-solid fa-ban text-xs"></i>
				{/if}
			</button>
		{:else}
			<button
				onclick={handleActivate}
				disabled={isActivating}
				title={tx('apiKeys.action.activate')}
				class="rounded-lg border border-brand-green/25 bg-brand-green/10 p-2 text-xs text-brand-green transition-all hover:bg-brand-green/20 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if isActivating}
					<i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
				{:else}
					<i class="fa-solid fa-rotate-left text-xs"></i>
				{/if}
			</button>
		{/if}
		<button
			onclick={() => onDelete(apiKey)}
			title="Delete"
			class="rounded-lg border border-brand-red/25 bg-brand-red/10 p-2 text-xs text-brand-red transition-all hover:bg-brand-red/20"
		>
			<i class="fa-solid fa-trash text-xs"></i>
		</button>
	</div>
</div>

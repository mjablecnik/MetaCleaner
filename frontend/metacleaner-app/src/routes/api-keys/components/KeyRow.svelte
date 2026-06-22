<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import { revokeApiKey } from '$lib/clients/apiKeysClient';
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		apiKey: ApiKey;
		onDelete: (key: ApiKey) => void;
		onRevoke: (key: ApiKey) => void;
	}

	const { apiKey, onDelete, onRevoke }: Props = $props();

	let isRevealed = $state(false);
	let copySuccess = $state(false);
	let copyError = $state(false);
	let isRevoking = $state(false);
	let revokeError = $state<string | null>(null);

	const keyDisplayHint = $derived(`${apiKey.key_prefix}${'•'.repeat(22)}${apiKey.key_suffix}`);
	const maskedDisplay = '•'.repeat(34);

	const isActive = $derived(apiKey.status === 'active');

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	async function copyKey() {
		copyError = false;
		try {
			await navigator.clipboard.writeText(keyDisplayHint);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch {
			copyError = true;
			setTimeout(() => {
				copyError = false;
			}, 2000);
		}
	}

	async function handleRevoke() {
		if (!isActive || isRevoking) return;
		isRevoking = true;
		revokeError = null;
		try {
			const updated = await revokeApiKey(apiKey.id);
			onRevoke(updated);
		} catch (e: unknown) {
			revokeError = e instanceof Error ? e.message : 'Failed to revoke key';
		} finally {
			isRevoking = false;
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
			{#if revokeError}
				<p class="mt-1 text-xs text-brand-red">
					<i class="fa-solid fa-circle-exclamation mr-1"></i>{revokeError}
				</p>
			{/if}
		</div>
	</div>
	<div class="flex flex-shrink-0 flex-wrap items-center gap-2">
		<div class="flex items-center gap-2 rounded-lg border border-gray-700 bg-navy-main px-3 py-2">
			<span class="font-mono text-xs text-text-muted">
				{isRevealed ? keyDisplayHint : maskedDisplay}
			</span>
			{#if isActive}
				<button
					onclick={() => (isRevealed = !isRevealed)}
					class="ml-1 text-text-muted transition-colors hover:text-white"
					aria-label={isRevealed ? 'Hide key' : 'Show key'}
				>
					<i class="fa-solid {isRevealed ? 'fa-eye-slash' : 'fa-eye'} text-xs"></i>
				</button>
			{/if}
		</div>
		{#if copyError}
			<span class="text-xs text-brand-red">Copy failed</span>
		{/if}
		<button
			onclick={copyKey}
			disabled={!isActive}
			title="Copy"
			class="rounded-lg border p-2 text-xs transition-all {isActive
				? 'border-gray-700 bg-navy-lighter text-text-muted hover:border-gray-600 hover:text-white'
				: 'cursor-not-allowed border-gray-700 bg-navy-lighter text-gray-600'}"
		>
			{#if copySuccess}
				<i class="fa-solid fa-check text-brand-green"></i>
			{:else}
				<i class="fa-solid fa-copy"></i>
			{/if}
		</button>
		{#if isActive}
			<button
				onclick={handleRevoke}
				disabled={isRevoking}
				title="Revoke"
				class="rounded-lg border border-brand-orange/25 bg-brand-orange/10 p-2 text-xs text-brand-orange transition-all hover:bg-brand-orange/20 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if isRevoking}
					<i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
				{:else}
					<i class="fa-solid fa-ban text-xs"></i>
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

<script lang="ts">
	import { onMount } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';
	import Badge from '$lib/shared/elements/Badge.svelte';
	import { revokeApiKey } from '$lib/clients/apiKeysClient';
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		apiKey: ApiKey;
		/** Full plaintext value for newly created keys (one-time reveal) */
		fullKey?: string;
		onDelete: (key: ApiKey) => void;
		onRevoke: (key: ApiKey) => void;
	}

	const { apiKey, fullKey, onDelete, onRevoke }: Props = $props();

	let isRevoking = $state(false);
	let operationError = $state<string | null>(null);
	let isCopied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	const hasFullKey = $derived(!!fullKey);
	// Start revealed when a full key is passed (newly created key); user can toggle
	let isRevealed = $state(false);
	onMount(() => {
		if (fullKey) isRevealed = true;
	});
	const keyDisplayMasked = $derived(`${apiKey.key_prefix}${'•'.repeat(18)}${apiKey.key_suffix}`);
	const keyDisplay = $derived(isRevealed && fullKey ? fullKey : keyDisplayMasked);

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
			operationError = e instanceof Error ? e.message : tx('apiKeys.error.revokeFailed');
		} finally {
			isRevoking = false;
		}
	}

	async function handleCopy() {
		const text = fullKey ?? keyDisplayMasked;
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
			isCopied = true;
			if (copyTimer !== null) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => {
				isCopied = false;
				copyTimer = null;
			}, 2000);
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
				{tx('apiKeys.createdAt')} {formatDate(apiKey.created_at)}
				{#if isActive && apiKey.last_used_at}
					· {tx('apiKeys.lastUsedAt')} {formatDate(apiKey.last_used_at)}
				{:else if !isActive && apiKey.revoked_at}
					· {tx('apiKeys.status.revoked')} {formatDate(apiKey.revoked_at)}
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
				{keyDisplay}
			</span>
		</div>
		<!-- Eye toggle (only shown when full key is available) -->
		{#if hasFullKey}
			<button
				onclick={() => (isRevealed = !isRevealed)}
				title={isRevealed ? tx('apiKeys.action.hideKey') : tx('apiKeys.action.showKey')}
				class="rounded-lg border border-gray-700 bg-navy-main p-2 text-xs text-text-muted transition-all hover:bg-navy-lighter hover:text-white"
			>
				<i class="fa-solid {isRevealed ? 'fa-eye-slash' : 'fa-eye'} text-xs"></i>
			</button>
		{/if}
		<!-- Copy button -->
		<button
			onclick={handleCopy}
			title={isCopied ? tx('apiKeys.action.copied') : tx('apiKeys.action.copyKey')}
			class="rounded-lg border p-2 text-xs transition-all {isCopied
				? 'border-brand-green/40 bg-brand-green/10 text-brand-green'
				: 'border-gray-700 bg-navy-main text-text-muted hover:bg-navy-lighter hover:text-white'}"
		>
			<i class="fa-solid {isCopied ? 'fa-check' : 'fa-copy'} text-xs"></i>
		</button>
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
		{/if}
		<button
			onclick={() => onDelete(apiKey)}
			title={tx('apiKeys.action.delete')}
			class="rounded-lg border border-brand-red/25 bg-brand-red/10 p-2 text-xs text-brand-red transition-all hover:bg-brand-red/20"
		>
			<i class="fa-solid fa-trash text-xs"></i>
		</button>
	</div>
</div>

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';
	import { deleteApiKey } from '$lib/clients/apiKeysClient';
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		apiKey: ApiKey | null;
		onClose: () => void;
		onDeleted: (id: string) => void;
	}

	const { apiKey, onClose, onDeleted }: Props = $props();

	let isDeleting = $state(false);
	let deleteError = $state<string | null>(null);

	async function handleDelete() {
		if (!apiKey || isDeleting) return;
		isDeleting = true;
		deleteError = null;
		try {
			await deleteApiKey(apiKey.id);
			onDeleted(apiKey.id);
		} catch (e: unknown) {
			deleteError = e instanceof Error ? e.message : 'Failed to delete key';
			isDeleting = false;
		}
	}

	function handleClose() {
		if (isDeleting) return;
		deleteError = null;
		onClose();
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (apiKey && e.key === 'Escape') handleClose();
	}}
/>

{#if apiKey}
	<div
		role="button"
		tabindex="-1"
		class="fixed inset-0 z-50 flex items-center justify-center bg-navy-main/85 px-4 backdrop-blur-[4px]"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') handleClose();
		}}
	>
		<div
			class="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-gray-700 bg-navy-card p-7 shadow-2xl"
		>
			<div class="flex flex-col items-center gap-3 text-center">
				<div
					class="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-red/30 bg-brand-red/15"
				>
					<i class="fa-solid fa-trash text-xl text-brand-red"></i>
				</div>
				<div>
					<p class="text-lg font-bold text-white">{tx('apiKeys.deleteModal.title')}</p>
					<p class="mt-1 text-sm text-text-muted">
						Key <span class="font-semibold text-white">"{apiKey.name}"</span> will be permanently removed.
					</p>
				</div>
			</div>
			<div
				class="flex items-start gap-2 rounded-xl border border-brand-red/25 bg-brand-red/8 p-3.5"
			>
				<i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-sm text-brand-red"></i>
				<p class="text-xs leading-relaxed text-text-muted">
					{tx('apiKeys.deleteModal.warning')} All applications using this key will immediately lose API
					access.
				</p>
			</div>
			{#if deleteError}
				<p class="text-xs text-brand-red">
					<i class="fa-solid fa-circle-exclamation mr-1"></i>{deleteError}
				</p>
			{/if}
			<div class="flex gap-3">
				<Button variant="secondary" fullWidth onclick={handleClose} disabled={isDeleting}>
					Cancel
				</Button>
				<Button variant="danger" fullWidth onclick={handleDelete} disabled={isDeleting}>
					{#if isDeleting}
						<i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
					{:else}
						<i class="fa-solid fa-trash text-xs"></i>
					{/if}
					Delete
				</Button>
			</div>
		</div>
	</div>
{/if}

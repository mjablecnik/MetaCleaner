<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';

	interface Props {
		keyName: string;
		onClose: () => void;
		onConfirm: () => void | Promise<void>;
	}

	let { keyName, onClose, onConfirm }: Props = $props();

	let isConfirming = $state(false);

	async function handleConfirm() {
		isConfirming = true;
		try {
			await onConfirm();
		} finally {
			isConfirming = false;
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
	<div class="w-full max-w-md rounded-2xl border border-gray-700 bg-navy-lighter p-6">
		<div class="mb-5 flex items-center gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red/10">
				<i class="fa-solid fa-trash text-brand-red"></i>
			</div>
			<h2 class="text-base font-semibold text-white">{tx('apiKeys.deleteModal.title')}</h2>
		</div>

		<div class="flex flex-col gap-4">
			<p class="text-sm text-text-muted">
				{tx('apiKeys.deleteModal.message', { name: keyName })}
			</p>

			<div
				class="flex items-start gap-2 rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2"
			>
				<i class="fa-solid fa-triangle-exclamation mt-0.5 text-xs text-brand-red"></i>
				<p class="text-xs text-brand-red">{tx('apiKeys.deleteModal.warning')}</p>
			</div>

			<div class="flex gap-3">
				<Button variant="secondary" fullWidth disabled={isConfirming} onclick={onClose}>
					{tx('apiKeys.deleteModal.cancel')}
				</Button>
				<Button variant="danger" fullWidth disabled={isConfirming} onclick={handleConfirm}>
					{#if isConfirming}
						<i class="fa-solid fa-circle-notch animate-spin"></i>
					{:else}
						<i class="fa-solid fa-trash"></i>
					{/if}
					{tx('apiKeys.deleteModal.confirm')}
				</Button>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';
	import {
		deleteAccount,
		AccountError,
		accountErrorToI18nKey
	} from '$lib/clients/accountClient.js';
	import { authStore } from '$lib/auth/auth.svelte.js';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let isDeleting = $state(false);
	let errorMessage = $state('');

	async function handleConfirm() {
		isDeleting = true;
		errorMessage = '';
		try {
			await deleteAccount();
			await authStore.logout();
			goto(resolve('/login' as Pathname), { replaceState: true });
		} catch (err) {
			if (err instanceof AccountError) {
				errorMessage = tx(accountErrorToI18nKey(err) as Parameters<typeof tx>[0]);
			} else {
				errorMessage = tx('settings.error.unknown');
			}
			isDeleting = false;
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
	<div class="w-full max-w-md rounded-2xl border border-gray-700 bg-navy-lighter p-6">
		<div class="mb-5 flex items-center gap-3">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-red/10">
				<i class="fa-solid fa-triangle-exclamation text-brand-red"></i>
			</div>
			<h2 class="text-base font-semibold text-white">{tx('settings.deletion.title')}</h2>
		</div>

		<div class="flex flex-col gap-4">
			<p class="text-sm text-text-muted">
				{tx('settings.deletion.message')}
			</p>

			<div
				class="flex items-start gap-2 rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2"
			>
				<i class="fa-solid fa-triangle-exclamation mt-0.5 text-xs text-brand-red"></i>
				<p class="text-xs text-brand-red">{tx('settings.deletion.warning')}</p>
			</div>

			{#if errorMessage}
				<p class="text-sm text-brand-red">
					<i class="fa-solid fa-circle-exclamation mr-1"></i>{errorMessage}
				</p>
			{/if}

			<div class="flex gap-3">
				<Button variant="secondary" fullWidth disabled={isDeleting} onclick={onClose}>
					{tx('settings.deletion.cancel')}
				</Button>
				<Button variant="danger" fullWidth disabled={isDeleting} onclick={handleConfirm}>
					{#if isDeleting}
						<i class="fa-solid fa-circle-notch animate-spin"></i>
					{:else}
						<i class="fa-solid fa-trash"></i>
					{/if}
					{tx('settings.deletion.confirm')}
				</Button>
			</div>
		</div>
	</div>
</div>

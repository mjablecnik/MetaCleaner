<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';
	import { createApiKey } from '$lib/clients/apiKeysClient';
	import type { ApiKey } from '$lib/clients/apiKeysClient';

	interface Props {
		open: boolean;
		onClose: () => void;
		onCreated: (key: ApiKey, fullKey: string) => void;
	}

	const { open, onClose, onCreated }: Props = $props();

	let name = $state('');
	let note = $state('');
	let nameError = $state('');
	let submitError = $state('');
	let isSubmitting = $state(false);
	let createdKey = $state('');
	let createdApiKey = $state<ApiKey | null>(null);
	let copySuccess = $state(false);

	const isSuccess = $derived(createdKey !== '');

	function resetForm() {
		name = '';
		note = '';
		nameError = '';
		submitError = '';
		isSubmitting = false;
		createdKey = '';
		createdApiKey = null;
		copySuccess = false;
	}

	function handleClose() {
		if (isSuccess && createdApiKey) {
			const key = createdApiKey;
			const fullKey = createdKey;
			resetForm();
			onCreated(key, fullKey);
		} else {
			resetForm();
			onClose();
		}
	}

	function validateName(): boolean {
		const trimmed = name.trim();
		if (!trimmed) {
			nameError = tx('settings.validation.apiKeyNameRequired');
			return false;
		}
		if (trimmed.length > 100) {
			nameError = tx('settings.validation.apiKeyNameTooLong');
			return false;
		}
		nameError = '';
		return true;
	}

	async function handleSubmit() {
		if (!validateName()) return;
		isSubmitting = true;
		submitError = '';
		try {
			const res = await createApiKey({
				name: name.trim(),
				note: note.trim() || undefined
			});
			createdKey = res.key;
			createdApiKey = res.api_key;
		} catch (e: unknown) {
			submitError = e instanceof Error ? e.message : 'Failed to create key';
		} finally {
			isSubmitting = false;
		}
	}

	async function copyKey() {
		const text = createdKey;
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
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (open && e.key === 'Escape') handleClose();
	}}
/>

{#if open}
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
			class="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-gray-700 bg-navy-card p-7 shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-green/30 bg-brand-green/15"
					>
						<i class="fa-solid fa-plus text-sm text-brand-green"></i>
					</div>
					<div>
						<p class="text-base font-bold text-white">{tx('apiKeys.createModal.title')}</p>
						<p class="text-xs text-text-muted">{tx('apiKeys.createModal.subtitle')}</p>
					</div>
				</div>
				<button
					onclick={handleClose}
					class="text-text-muted transition-colors hover:text-white"
					aria-label={tx('common.dismiss')}
				>
					<i class="fa-solid fa-xmark text-lg"></i>
				</button>
			</div>

			{#if isSuccess}
				<!-- Key reveal state -->
				<div
					class="flex items-start gap-3 rounded-xl border border-brand-green/25 bg-brand-green/8 p-4"
				>
					<i class="fa-solid fa-circle-check mt-0.5 shrink-0 text-brand-green"></i>
					<div>
						<p class="mb-0.5 text-sm font-semibold text-white">
							{tx('apiKeys.createModal.success')}
						</p>
						<p class="text-xs text-text-muted">{tx('apiKeys.createModal.copyWarning')}</p>
					</div>
				</div>
				<div>
					<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
						{tx('apiKeys.createModal.keyValueLabel')}
					</p>
					<div
						class="flex items-center justify-between gap-3 rounded-xl border border-brand-green/30 bg-navy-main p-4"
					>
						<span class="font-mono text-xs break-all text-brand-green">{createdKey}</span>
						<button
							onclick={copyKey}
							class="flex shrink-0 items-center gap-1 rounded-lg border border-brand-green/30 bg-brand-green/15 px-3 py-1.5 text-xs font-semibold text-brand-green transition-all hover:bg-brand-green/25"
						>
							{#if copySuccess}
								<i class="fa-solid fa-check text-[10px]"></i>
								{tx('apiKeys.action.copied')}
							{:else}
								<i class="fa-solid fa-copy text-[10px]"></i>
								{tx('apiKeys.action.copyKey')}
							{/if}
						</button>
					</div>
				</div>
				<Button variant="secondary" fullWidth onclick={handleClose}>{tx('apiKeys.createModal.done')}</Button>
			{:else}
				<!-- Create form -->
				<div class="flex flex-col gap-4">
					<div>
						<label
							for="create-key-name"
							class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
						>
							{tx('apiKeys.createModal.nameLabel')}
							<span class="text-brand-red">*</span>
						</label>
						<input
							id="create-key-name"
							type="text"
							bind:value={name}
							placeholder={tx('apiKeys.createModal.namePlaceholder')}
							maxlength="100"
							class="w-full rounded-xl border bg-navy-main px-4 py-3 text-sm text-white transition-colors placeholder:text-text-muted focus:outline-none {nameError
								? 'border-brand-red focus:border-brand-red'
								: 'border-gray-700 focus:border-brand-green'}"
						/>
						{#if nameError}
							<p class="mt-1 text-xs text-brand-red">
								<i class="fa-solid fa-circle-exclamation mr-1"></i>{nameError}
							</p>
						{/if}
					</div>
					<div>
						<label
							for="create-key-note"
							class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
						>
							{tx('apiKeys.createModal.noteLabel')}
						</label>
						<textarea
							id="create-key-note"
							bind:value={note}
							placeholder={tx('apiKeys.createModal.notePlaceholder')}
							rows={2}
							maxlength="500"
							class="w-full resize-none rounded-xl border border-gray-700 bg-navy-main px-4 py-3 text-sm text-white transition-colors placeholder:text-text-muted focus:border-brand-green focus:outline-none"
						></textarea>
					</div>
					{#if submitError}
						<p class="text-xs text-brand-red">
							<i class="fa-solid fa-triangle-exclamation mr-1"></i>{submitError}
						</p>
					{/if}
				</div>
				<div class="flex gap-3">
					<Button variant="secondary" fullWidth onclick={handleClose}>{tx('apiKeys.createModal.cancel')}</Button>
					<Button variant="primary" fullWidth onclick={handleSubmit} disabled={isSubmitting}>
						{#if isSubmitting}
							<i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
						{:else}
							<i class="fa-solid fa-key text-xs"></i>
						{/if}
						{tx('apiKeys.createModal.submit')}
					</Button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import AuthTextInput from '$lib/shared/elements/AuthTextInput.svelte';
	import Button from '$lib/shared/elements/Button.svelte';
	import CopyButton from '$lib/shared/elements/CopyButton.svelte';
	import { createApiKey, type ApiKey } from '$lib/clients/apiKeysClient.js';
	import { validateApiKeyName, validateApiKeyNote } from '../validation.js';

	interface Props {
		onClose: () => void;
		onCreated: (key: ApiKey) => void;
	}

	let { onClose, onCreated }: Props = $props();

	let name = $state('');
	let note = $state('');
	let nameError = $state('');
	let noteError = $state('');
	let generalError = $state('');
	let isSubmitting = $state(false);
	let createdKey = $state<string | null>(null);
	let createdApiKey = $state<ApiKey | null>(null);

	async function handleSubmit() {
		nameError = '';
		noteError = '';
		generalError = '';

		const nameErr = validateApiKeyName(name);
		const noteErr = validateApiKeyNote(note);

		if (nameErr) nameError = tx(nameErr as Parameters<typeof tx>[0]);
		if (noteErr) noteError = tx(noteErr as Parameters<typeof tx>[0]);

		if (nameErr || noteErr) return;

		isSubmitting = true;
		try {
			const result = await createApiKey({ name: name.trim(), note: note.trim() || undefined });
			createdKey = result.key;
			createdApiKey = result.api_key;
		} catch {
			generalError = tx('apiKeys.error.createFailed');
		} finally {
			isSubmitting = false;
		}
	}

	function handleDone() {
		if (createdApiKey) {
			onCreated(createdApiKey);
		}
		onClose();
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
	<div class="w-full max-w-md rounded-2xl border border-gray-700 bg-navy-lighter p-6">
		{#if createdKey}
			<div class="flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/10">
						<i class="fa-solid fa-check text-brand-green"></i>
					</div>
					<h2 class="text-base font-semibold text-white">{tx('apiKeys.createModal.success')}</h2>
				</div>

				<div class="rounded-xl border border-brand-green/20 bg-navy-main p-3">
					<p class="mb-2 text-xs text-text-muted">{tx('apiKeys.createModal.keyValueLabel')}</p>
					<div class="flex items-center gap-2">
						<code class="min-w-0 flex-1 font-mono text-sm break-all text-white">{createdKey}</code>
						<CopyButton text={createdKey} />
					</div>
				</div>

				<div
					class="flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2"
				>
					<i class="fa-solid fa-triangle-exclamation mt-0.5 text-xs text-yellow-400"></i>
					<p class="text-xs text-yellow-400">{tx('apiKeys.createModal.copyWarning')}</p>
				</div>

				<Button variant="primary" fullWidth onclick={handleDone}>
					{tx('apiKeys.createModal.done')}
				</Button>
			</div>
		{:else}
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-base font-semibold text-white">{tx('apiKeys.createModal.title')}</h2>
				<button
					type="button"
					aria-label={tx('common.dismiss')}
					class="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-gray-700 hover:text-white"
					onclick={onClose}
				>
					<i class="fa-solid fa-xmark text-sm"></i>
				</button>
			</div>

			<div class="flex flex-col gap-4">
				<AuthTextInput
					id="create-key-name"
					label={tx('apiKeys.createModal.nameLabel')}
					bind:value={name}
					placeholder={tx('apiKeys.createModal.namePlaceholder')}
					error={nameError}
					disabled={isSubmitting}
				/>

				<div class="flex flex-col gap-1.5">
					<label for="create-key-note" class="text-sm font-medium text-white">
						{tx('apiKeys.createModal.noteLabel')}
					</label>
					<textarea
						id="create-key-note"
						bind:value={note}
						placeholder={tx('apiKeys.createModal.notePlaceholder')}
						disabled={isSubmitting}
						rows="3"
						class="w-full resize-none rounded-xl border border-navy-lighter bg-navy-main px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-brand-blue focus:outline-none disabled:opacity-60"
					></textarea>
					{#if noteError}
						<span class="text-[12px] text-brand-red">
							<i class="fa-solid fa-circle-exclamation mr-1"></i>{noteError}
						</span>
					{/if}
				</div>

				{#if generalError}
					<p class="text-sm text-brand-red">
						<i class="fa-solid fa-circle-exclamation mr-1"></i>{generalError}
					</p>
				{/if}

				<div class="flex gap-3">
					<Button variant="secondary" fullWidth disabled={isSubmitting} onclick={onClose}>
						{tx('apiKeys.createModal.cancel')}
					</Button>
					<Button variant="primary" fullWidth disabled={isSubmitting} onclick={handleSubmit}>
						{#if isSubmitting}
							<i class="fa-solid fa-circle-notch animate-spin"></i>
						{/if}
						{tx('apiKeys.createModal.submit')}
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tx } from '$lib/shared/utils/i18n';

	interface Props {
		title: string;
		content: Snippet;
		confirmLabel?: string;
		cancelLabel?: string;
		confirmStyle?: 'primary' | 'danger' | 'secondary';
		isLoading?: boolean;
		error?: string | null;
		onConfirm: () => void;
		onCancel: () => void;
	}

	const {
		title,
		content,
		confirmLabel = tx('subscription.modal.confirm'),
		cancelLabel = tx('subscription.modal.cancel'),
		confirmStyle = 'primary',
		isLoading = false,
		error = null,
		onConfirm,
		onCancel
	}: Props = $props();

	const confirmButtonClass = $derived(() => {
		const base =
			'w-full py-3.5 rounded-xl text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
		if (confirmStyle === 'danger') {
			return `${base} bg-brand-red text-white hover:bg-red-600`;
		}
		if (confirmStyle === 'secondary') {
			return `${base} border border-gray-700 text-white hover:bg-navy-lighter`;
		}
		return `${base} bg-brand-orange text-white hover:bg-orange-600`;
	});

	const cancelButtonClass = $derived(() => {
		if (confirmStyle === 'danger') {
			return 'w-full py-3 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50';
		}
		return 'w-full py-3 rounded-xl text-text-muted text-sm font-medium hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50';
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onCancel();
		}
	}
</script>

<!-- Desktop: centered dialog -->
<div
	class="fixed inset-0 z-50 hidden items-center justify-center lg:flex"
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
>
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-black/70"
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Dialog -->
	<div
		class="relative mx-4 w-full max-w-md rounded-2xl border border-gray-700 bg-navy-card p-6"
	>
		<div class="mb-5 flex items-center justify-between">
			<h2 id="modal-title" class="text-lg font-bold text-white">{title}</h2>
			<button
				onclick={onCancel}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-navy-lighter"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>

		<div class="mb-5">
			{@render content()}
		</div>

		{#if error}
			<div class="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{error}
			</div>
		{/if}

		<button onclick={onConfirm} disabled={isLoading} class={confirmButtonClass()}>
			{#if isLoading}
				<i class="fa-solid fa-spinner fa-spin mr-2"></i>
				{tx('subscription.modal.loading')}
			{:else}
				{confirmLabel}
			{/if}
		</button>
		<button onclick={onCancel} disabled={isLoading} class={cancelButtonClass()}>
			{cancelLabel}
		</button>
	</div>
</div>

<!-- Mobile: bottom sheet -->
<div
	class="fixed inset-0 z-50 flex items-end justify-center lg:hidden"
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title-mobile"
>
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-black/70"
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Bottom sheet -->
	<div
		class="relative w-full max-w-lg rounded-t-3xl border-t border-gray-800 bg-navy-card p-6 pb-10"
	>
		<div class="mb-4 flex items-center justify-between">
			<h2 id="modal-title-mobile" class="text-lg font-bold text-white">{title}</h2>
			<button
				onclick={onCancel}
				class="flex h-8 w-8 items-center justify-center rounded-full bg-navy-lighter"
			>
				<i class="fa-solid fa-xmark text-sm"></i>
			</button>
		</div>

		<div class="mb-4">
			{@render content()}
		</div>

		{#if error}
			<div class="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{error}
			</div>
		{/if}

		<button onclick={onConfirm} disabled={isLoading} class={confirmButtonClass()}>
			{#if isLoading}
				<i class="fa-solid fa-spinner fa-spin mr-2"></i>
				{tx('subscription.modal.loading')}
			{:else}
				{confirmLabel}
			{/if}
		</button>
		<button onclick={onCancel} disabled={isLoading} class={cancelButtonClass()}>
			{cancelLabel}
		</button>
	</div>
</div>

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
			'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';
		if (confirmStyle === 'danger') {
			return `${base} border border-red-600 bg-red-600/10 text-red-400 hover:bg-red-600/20`;
		}
		if (confirmStyle === 'secondary') {
			return `${base} border border-gray-600 bg-transparent text-text-muted hover:bg-gray-700/40`;
		}
		return `${base} bg-brand-blue text-white hover:bg-brand-blue/90`;
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
		class="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Dialog -->
	<div
		class="animate-fade-in relative w-full max-w-[480px] rounded-2xl border border-gray-700 bg-navy-card p-6 shadow-2xl"
	>
		<h2 id="modal-title" class="mb-4 text-lg font-bold text-white">{title}</h2>

		<div class="mb-6 text-sm text-text-muted">
			{@render content()}
		</div>

		{#if error}
			<div class="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{error}
			</div>
		{/if}

		<div class="flex items-center justify-end gap-3">
			<button
				onclick={onCancel}
				disabled={isLoading}
				class="rounded-xl border border-gray-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-text-muted transition-all duration-200 hover:bg-gray-700/40 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{cancelLabel}
			</button>
			<button onclick={onConfirm} disabled={isLoading} class={confirmButtonClass()}>
				{#if isLoading}
					<i class="fa-solid fa-spinner fa-spin"></i>
					{tx('subscription.modal.loading')}
				{:else}
					{confirmLabel}
				{/if}
			</button>
		</div>
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
		class="absolute inset-0 bg-black/60 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Bottom sheet -->
	<div
		class="animate-slide-up relative w-full max-w-lg rounded-t-2xl border-t border-gray-800 bg-navy-card p-6 pb-10"
	>
		<h2 id="modal-title-mobile" class="mb-4 text-lg font-bold text-white">{title}</h2>

		<div class="mb-6 text-sm text-text-muted">
			{@render content()}
		</div>

		{#if error}
			<div class="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
				<i class="fa-solid fa-circle-exclamation mr-1.5"></i>{error}
			</div>
		{/if}

		<div class="flex flex-col gap-3">
			<button onclick={onConfirm} disabled={isLoading} class={confirmButtonClass()}>
				{#if isLoading}
					<i class="fa-solid fa-spinner fa-spin"></i>
					{tx('subscription.modal.loading')}
				{:else}
					{confirmLabel}
				{/if}
			</button>
			<button
				onclick={onCancel}
				disabled={isLoading}
				class="rounded-xl border border-gray-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-text-muted transition-all duration-200 hover:bg-gray-700/40 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{cancelLabel}
			</button>
		</div>
	</div>
</div>

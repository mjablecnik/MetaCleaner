<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Button from '$lib/shared/elements/Button.svelte';
	import AccountDeletionModal from '../components/AccountDeletionModal.svelte';

	interface Props {
		collapsible?: boolean;
	}

	let { collapsible = false }: Props = $props();

	let showModal = $state(false);
	let isOpen = $state(false);
</script>

<div
	class="fade-in-up overflow-hidden rounded-2xl border border-brand-red/20 bg-navy-card shadow-card"
>
	{#if collapsible}
		<button
			type="button"
			class="w-full px-5 py-4 text-left lg:px-6"
			onclick={() => (isOpen = !isOpen)}
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-red/20 bg-brand-red/10"
				>
					<i class="fa-solid fa-triangle-exclamation text-sm text-brand-red"></i>
				</div>
				<div class="flex-1">
					<h3 class="text-sm font-semibold text-white lg:text-base">
						{tx('settings.dangerZone.title')}
					</h3>
					<p class="text-[11px] text-text-muted">{tx('settings.dangerZone.subtitle')}</p>
				</div>
				<i
					class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
					class:rotate-180={isOpen}
				></i>
			</div>
		</button>

		{#if isOpen}
			<div class="flex flex-col gap-3 border-t border-brand-red/20 px-5 pt-4 pb-5 lg:px-6">
				<div class="flex flex-col gap-1">
					<p class="text-sm font-medium text-white">{tx('settings.dangerZone.deleteTitle')}</p>
					<p class="text-xs text-text-muted">{tx('settings.dangerZone.deleteDescription')}</p>
				</div>
				<Button variant="danger" onclick={() => (showModal = true)}>
					<i class="fa-solid fa-trash"></i>
					{tx('settings.dangerZone.deleteButton')}
				</Button>
			</div>
		{/if}
	{:else}
		<div class="px-5 py-4 lg:px-6">
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-red/20 bg-brand-red/10"
				>
					<i class="fa-solid fa-triangle-exclamation text-sm text-brand-red"></i>
				</div>
				<div>
					<h3 class="text-sm font-semibold text-white lg:text-base">
						{tx('settings.dangerZone.title')}
					</h3>
					<p class="text-[11px] text-text-muted">{tx('settings.dangerZone.subtitle')}</p>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-3 border-t border-brand-red/20 px-5 pt-4 pb-5 lg:px-6">
			<div class="flex flex-col gap-1">
				<p class="text-sm font-medium text-white">{tx('settings.dangerZone.deleteTitle')}</p>
				<p class="text-xs text-text-muted">{tx('settings.dangerZone.deleteDescription')}</p>
			</div>
			<Button variant="danger" onclick={() => (showModal = true)}>
				<i class="fa-solid fa-trash"></i>
				{tx('settings.dangerZone.deleteButton')}
			</Button>
		</div>
	{/if}
</div>

{#if showModal}
	<AccountDeletionModal onClose={() => (showModal = false)} />
{/if}

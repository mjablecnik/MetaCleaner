<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import type { ErrorType } from './ErrorStateCard.svelte';

	interface Props {
		selectedErrorType: ErrorType;
		onSelectErrorType: (type: ErrorType) => void;
	}

	const { selectedErrorType, onSelectErrorType }: Props = $props();

	let open = $state(true);

	const errorTypes: { id: ErrorType; icon: string; title: string; description: string }[] = [
		{
			id: 'cleaning',
			icon: 'fa-circle-xmark',
			title: 'step4.type.cleaning.title',
			description: 'step4.type.cleaning.description'
		},
		{
			id: 'connection',
			icon: 'fa-wifi',
			title: 'step4.type.connection.title',
			description: 'step4.type.connection.description'
		},
		{
			id: 'timeout',
			icon: 'fa-clock',
			title: 'step4.type.timeout.title',
			description: 'step4.type.timeout.description'
		}
	];
</script>

<div class="overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card">
	<button onclick={() => (open = !open)} class="flex w-full items-center justify-between px-4 py-4">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-tag text-sm text-text-muted"></i>
			<span class="text-sm font-semibold text-white">{tx('step4.type.title')}</span>
		</div>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
			class:rotate-180={open}
		></i>
	</button>

	{#if open}
		<div class="flex flex-col gap-2 px-4 pb-4">
			{#each errorTypes as errorType (errorType.id)}
				{@const isActive = selectedErrorType === errorType.id}
				<button
					onclick={() => onSelectErrorType(errorType.id)}
					class="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all {isActive
						? 'border-brand-red/30 bg-brand-red/10'
						: 'border-gray-800 bg-navy-main/60'}"
				>
					<div
						class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border {isActive
							? 'border-brand-red/25 bg-brand-red/15'
							: 'border-gray-700 bg-navy-lighter'}"
					>
						<i
							class="fa-solid {errorType.icon} text-xs {isActive
								? 'text-brand-red'
								: 'text-text-muted'}"
						></i>
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-xs font-semibold {isActive ? 'text-white' : 'text-text-muted'}">
							{tx(errorType.title)}
						</p>
						<p class="text-[10px] text-text-muted">{tx(errorType.description)}</p>
					</div>
					<i
						class="fa-solid {isActive
							? 'fa-circle-dot text-brand-red'
							: 'fa-circle text-gray-700'} text-xs"
					></i>
				</button>
			{/each}
		</div>
	{/if}
</div>

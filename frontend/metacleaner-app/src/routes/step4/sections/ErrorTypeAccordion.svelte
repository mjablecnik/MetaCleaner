<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorState } from '$lib/types/processing';
	import ErrorTypeSelector from '../components/ErrorTypeSelector.svelte';

	interface Props {
		errorState: ErrorState | null;
		selectedErrorType: string;
		open?: boolean;
	}

	let { errorState, selectedErrorType = $bindable(), open = $bindable(true) }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card lg:hidden">
	<button onclick={() => (open = !open)} class="flex w-full items-center justify-between px-4 py-4">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-tag text-sm text-text-muted"></i>
			<span class="text-sm font-semibold text-white">{tx('step4.type.title')}</span>
		</div>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform"
			style="transform: {open ? 'rotate(180deg)' : ''}"
		></i>
	</button>
	{#if open}
		<div class="px-4 pb-4">
			<ErrorTypeSelector
				types={errorState?.errorTypes ?? []}
				selected={selectedErrorType}
				onSelect={(id) => (selectedErrorType = id)}
			/>
		</div>
	{/if}
</div>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { SimpleLogEntry } from './ErrorStateCard.svelte';

	interface Props {
		logEntries: SimpleLogEntry[];
	}

	const { logEntries }: Props = $props();

	let open = $state(true);

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}
</script>

<div class="overflow-hidden rounded-2xl border border-gray-800 bg-navy-card shadow-card">
	<button onclick={() => (open = !open)} class="flex w-full items-center justify-between px-4 py-4">
		<div class="flex items-center gap-2">
			<i class="fa-solid fa-terminal text-sm text-text-muted"></i>
			<span class="text-sm font-semibold text-white">{tx('step4.log.title')}</span>
		</div>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
			class:rotate-180={open}
		></i>
	</button>

	{#if open}
		<div class="px-4 pb-4">
			<div
				class="flex flex-col gap-1.5 rounded-xl border border-gray-800 bg-navy-main/80 p-3 font-mono"
			>
				{#each logEntries as entry, i (i)}
					<div class="flex items-start gap-2">
						<span class="mt-0.5 flex-shrink-0 text-[10px] text-text-muted">—</span>
						<span class="text-[11px] {entry.isError ? 'text-brand-red' : 'text-brand-green'}">
							{entry.text}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ErrorType } from '$lib/repositories/processingRepository';

	interface Props {
		types: ErrorType[];
		selected: string;
		onSelect: (id: string) => void;
	}

	const { types, selected, onSelect }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="flex flex-col gap-1.5">
	{#each types as errType (errType.id)}
		<button
			onclick={() => onSelect(errType.id)}
			class="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all {selected ===
			errType.id
				? 'border-brand-red/30 bg-brand-red/10'
				: 'border-gray-700 bg-navy-main/60'}"
		>
			<div
				class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border {selected ===
				errType.id
					? 'border-brand-red/25 bg-brand-red/15'
					: 'border-gray-700 bg-navy-lighter'}"
			>
				<i
					class="fa-solid {errType.icon} text-xs {selected === errType.id
						? 'text-brand-red'
						: 'text-text-muted'}"
				></i>
			</div>
			<div class="min-w-0 flex-1">
				<p
					class="text-xs font-semibold {selected === errType.id
						? 'text-text-main'
						: 'text-text-muted'}"
				>
					{tx(`step4.type.${errType.id}.title`)}
				</p>
				<p class="text-[10px] text-text-muted">{tx(`step4.type.${errType.id}.description`)}</p>
			</div>
			<i
				class="fa-solid text-xs {selected === errType.id ? 'text-brand-red' : 'text-gray-700'}"
				class:fa-circle-dot={selected === errType.id}
				class:fa-circle={selected !== errType.id}
			></i>
		</button>
	{/each}
</div>

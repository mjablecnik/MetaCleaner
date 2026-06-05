<script lang="ts">
	export type ActivityLogStatus = 'success' | 'in_progress' | 'error' | 'waiting' | 'skipped';

	export interface ActivityLogEntry {
		timestamp: string;
		text: string;
		status: ActivityLogStatus;
	}

	interface Props {
		entries: ActivityLogEntry[];
		class?: string;
	}

	const { entries, class: extraClass = '' }: Props = $props();
</script>

<div
	class="flex flex-col gap-1.5 overflow-y-auto rounded-xl border border-gray-800 bg-navy-main/80 p-3 font-mono {extraClass}"
>
	{#each entries as entry (entry.timestamp)}
		<div
			class="flex items-start gap-2"
			class:opacity-40={entry.status === 'waiting' || entry.status === 'skipped'}
		>
			<span class="mt-0.5 flex-shrink-0 text-[10px] text-text-muted">{entry.timestamp}</span>
			{#if entry.status === 'success'}
				<span class="text-[11px] text-brand-green">{entry.text}</span>
			{:else if entry.status === 'in_progress'}
				<span class="flex items-center gap-1 text-[11px] text-brand-blue">
					<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>{entry.text}
				</span>
			{:else if entry.status === 'error'}
				<span class="text-[11px] text-brand-red">{entry.text}</span>
			{:else}
				<span class="text-[11px] text-text-muted">{entry.text}</span>
			{/if}
		</div>
	{/each}
</div>

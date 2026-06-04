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
	class="bg-navy-main/80 rounded-xl border border-gray-800 p-3 flex flex-col gap-1.5 overflow-y-auto font-mono {extraClass}"
>
	{#each entries as entry}
		<div
			class="flex items-start gap-2"
			class:opacity-40={entry.status === 'waiting' || entry.status === 'skipped'}
		>
			<span class="text-[10px] text-text-muted mt-0.5 flex-shrink-0">{entry.timestamp}</span>
			{#if entry.status === 'success'}
				<span class="text-[11px] text-brand-green">{entry.text}</span>
			{:else if entry.status === 'in_progress'}
				<span class="text-[11px] text-brand-blue flex items-center gap-1">
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

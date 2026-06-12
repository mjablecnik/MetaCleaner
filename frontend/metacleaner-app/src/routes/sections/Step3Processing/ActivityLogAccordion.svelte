<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import ActivityLog from '$lib/shared/components/ActivityLog.svelte';
	import type { ActivityLogEntry } from '$lib/shared/components/ActivityLog.svelte';

	interface Props {
		entries: ActivityLogEntry[];
	}

	const { entries }: Props = $props();

	let open = $state(false);
</script>

<div class="rounded-2xl border border-gray-800 bg-navy-card shadow-card">
	<button
		onclick={() => (open = !open)}
		class="flex w-full items-center justify-between px-4 py-3.5"
	>
		<span class="text-sm font-semibold text-white">{tx('step3.log.title')}</span>
		<i
			class="fa-solid fa-chevron-down text-xs text-text-muted transition-transform duration-200"
			class:rotate-180={open}
		></i>
	</button>

	{#if open}
		<div class="px-4 pb-4">
			<ActivityLog {entries} class="max-h-[200px]" />
		</div>
	{/if}
</div>

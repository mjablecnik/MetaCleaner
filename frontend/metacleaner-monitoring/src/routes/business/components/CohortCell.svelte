<script lang="ts">
	interface Props {
		percent: number | null;
	}

	let { percent }: Props = $props();

	const opacity = $derived(percent !== null ? (percent / 100) * 0.3 : 0);
	const textColor = $derived(percent !== null && percent > 70 ? '#22c55e' : '#94a3b8');
</script>

{#if percent === null}
	<span class="text-border">—</span>
{:else}
	<span
		class="px-1.5 py-0.5 rounded text-xs font-medium"
		style="background:rgba(34,197,94,{opacity});color:{textColor}"
	>
		{percent}%
	</span>
{/if}

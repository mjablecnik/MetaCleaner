<script lang="ts">
	interface Props {
		cost: number;
	}

	const { cost }: Props = $props();
</script>

<span
	class="inline-flex items-center gap-1 rounded-full border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold text-brand-green"
>
	<i class="fa-solid fa-bolt text-[8px]"></i>
	{cost}
</span>

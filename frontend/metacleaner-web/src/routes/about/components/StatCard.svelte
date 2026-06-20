<script lang="ts">
	interface Props {
		value: string;
		label: string;
		colorClass: string;
	}

	const { value, label, colorClass }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center p-4 rounded-xl bg-navy-main/60 border border-border">
	<span class="text-3xl font-bold {colorClass}">{value}</span>
	<span class="text-xs text-text-muted mt-1 text-center">{label}</span>
</div>

<script lang="ts">
	interface Props {
		icon: string;
		href?: string;
	}

	const { icon, href = '#' }: Props = $props();
</script>

<a
	{href}
	class="w-9 h-9 rounded-lg bg-navy-card border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-border-strong transition-all"
>
	<i class="{icon} text-sm"></i>
</a>

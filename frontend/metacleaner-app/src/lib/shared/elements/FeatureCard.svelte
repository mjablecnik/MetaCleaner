<script lang="ts">
	interface Props {
		icon: string;
		iconColor: string;
		title: string;
		description: string;
	}

	const { icon, iconColor, title, description }: Props = $props();
</script>

<div class="flex flex-col gap-3 rounded-xl border border-gray-800 bg-navy-card p-4">
	<div class="flex items-center gap-3">
		<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
			<i class="{icon} text-sm {iconColor}"></i>
		</div>
		<span class="text-sm font-semibold text-white">{title}</span>
	</div>
	<p class="text-xs leading-relaxed text-text-muted">{description}</p>
</div>

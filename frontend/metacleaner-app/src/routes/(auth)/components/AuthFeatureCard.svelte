<script lang="ts">
	interface Props {
		icon: string;
		iconClass: string;
		iconBgClass: string;
		title: string;
		desc: string;
		badge?: string;
		badgeClass?: string;
		chips?: string[];
	}

	let { icon, iconClass, iconBgClass, title, desc, badge, badgeClass, chips }: Props = $props();
</script>

<div class="flex items-center gap-4 rounded-xl border border-gray-800 bg-navy-card p-4">
	<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg {iconBgClass}">
		<i class="{icon} {iconClass}"></i>
	</div>
	<div>
		<p class="text-sm font-semibold text-white">{title}</p>
		<p class="mt-0.5 text-xs text-text-muted">{desc}</p>
	</div>
	{#if badge}
		<div class="ml-auto">
			<span class="rounded px-2 py-1 text-xs font-bold {badgeClass ?? ''}">{badge}</span>
		</div>
	{:else if chips && chips.length > 0}
		<div class="ml-auto flex gap-1">
			{#each chips as chip (chip)}
				<span
					class="rounded bg-navy-lighter px-1.5 py-0.5 text-[10px] font-bold text-white uppercase"
					>{chip}</span
				>
			{/each}
		</div>
	{/if}
</div>

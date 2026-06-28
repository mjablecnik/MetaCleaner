<script lang="ts">
	interface NavItem {
		href: string;
		icon: string;
		label: string;
		activeClass?: string;
		badge?: number;
	}

	interface Props {
		items: NavItem[];
		activeHref: string;
	}

	let { items, activeHref }: Props = $props();
</script>

<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-surface flex items-center justify-around px-2 py-2">
	{#each items as item}
		{@const isActive = item.href === activeHref}
		<a
			href={item.href}
			class="flex flex-col items-center gap-1 px-3 py-1.5 transition-colors min-w-[44px] relative {isActive
				? (item.activeClass ?? 'text-primary')
				: 'text-textSec hover:text-textMain'}"
		>
			{#if item.badge}
				<div
					class="absolute -top-1 right-1/4 w-4 h-4 bg-error rounded-full flex items-center justify-center"
				>
					<span class="text-white font-bold" style="font-size:9px">{item.badge}</span>
				</div>
			{/if}
			<i class="fa-solid {item.icon} text-base"></i>
			<span class="text-xs {isActive ? 'font-semibold' : ''}">{item.label}</span>
		</a>
	{/each}
</nav>

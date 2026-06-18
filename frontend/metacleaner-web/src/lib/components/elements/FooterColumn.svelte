<script lang="ts">
	interface Link {
		href: string;
		label: string;
	}

	interface Props {
		heading: string;
		links: Link[];
	}

	const { heading, links }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<span class="text-xs font-bold uppercase tracking-widest text-text-muted">{heading}</span>
	<div class="flex flex-col gap-3">
		{#each links as link}
			<a href={link.href} class="text-sm text-text-muted hover:text-white transition-colors">{link.label}</a>
		{/each}
	</div>
</div>

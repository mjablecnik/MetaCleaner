<script lang="ts">
	interface Link {
		href: string;
		label: string;
	}

	interface Props {
		heading: string;
		links: Link[];
		headingClass?: string;
	}

	const {
		heading,
		links,
		headingClass = 'text-xs font-bold uppercase tracking-widest text-text-muted'
	}: Props = $props();
</script>

<div class="flex flex-col gap-4">
	<span class={headingClass}>{heading}</span>
	<div class="flex flex-col gap-3">
		{#each links as link}
			<a href={link.href} class="text-sm text-text-muted hover:text-white transition-colors">{link.label}</a>
		{/each}
	</div>
</div>

<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';

	interface Props {
		href: string;
		label: string;
		active?: boolean;
	}

	const { href, label, active = false }: Props = $props();

	const classes = $derived(
		active
			? 'text-sm font-medium text-white transition-colors'
			: 'text-sm font-medium text-text-muted hover:text-white transition-colors'
	);
</script>

<a href={localizeHref(href)} class={classes}>{label}</a>

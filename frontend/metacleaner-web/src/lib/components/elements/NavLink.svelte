<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

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

<a href={resolve(href as Pathname)} class={classes}>{label}</a>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">
	{@render children()}
</span>

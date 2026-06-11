<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	class="flex min-h-screen flex-col"
	style="background-image: radial-gradient(ellipse at 20% 50%, var(--color-page-gradient-blue) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, var(--color-page-gradient-green) 0%, transparent 50%);"
>
	{@render children()}
</div>

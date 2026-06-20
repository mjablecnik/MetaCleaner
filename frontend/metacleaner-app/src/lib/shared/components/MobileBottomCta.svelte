<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	class="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-800 bg-navy-main px-6 py-4 lg:hidden"
>
	{@render children()}
</div>

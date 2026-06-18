<script lang="ts">
	import BrandLogo from '$lib/components/elements/BrandLogo.svelte';

	interface Props {
		open: boolean;
		onToggle: () => void;
	}

	const { open, onToggle }: Props = $props();
</script>

<nav
	class="md:hidden w-full px-4 py-4 flex justify-between items-center z-50 sticky top-0 bg-navy-main border-b border-border/50"
>
	<BrandLogo size="md" href="/" />
	<button
		onclick={onToggle}
		aria-label={open ? 'Close menu' : 'Open menu'}
		class="w-9 h-9 rounded-lg bg-navy-lighter border border-border-strong flex items-center justify-center text-white"
	>
		<i class="fa-solid {open ? 'fa-xmark' : 'fa-bars'} text-sm"></i>
	</button>
</nav>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onClose: () => void;
		children?: Snippet;
	}

	let { open, title, onClose, children }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="sheet-overlay" class:open onclick={onClose}></div>

<div class="bottom-sheet" class:open>
	<div class="flex items-center justify-between border-b border-gray-700 px-5 pt-5 pb-4">
		<h3 class="text-base font-bold text-white">{title}</h3>
		<button
			type="button"
			onclick={onClose}
			class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-lighter text-text-muted transition-colors hover:text-white"
		>
			<i class="fa-solid fa-xmark"></i>
		</button>
	</div>
	{@render children?.()}
</div>

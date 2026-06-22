<script lang="ts">
	interface Props {
		text: string;
		class?: string;
	}

	const { text, class: extraClass = '' }: Props = $props();

	let confirmed = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	async function handleClick() {
		if (confirmed) {
			if (timer !== null) {
				clearTimeout(timer);
				timer = null;
			}
		} else {
			try {
				await navigator.clipboard.writeText(text);
			} catch {
				return;
			}
		}

		confirmed = true;
		timer = setTimeout(() => {
			confirmed = false;
			timer = null;
		}, 2000);
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class="inline-flex items-center justify-center rounded p-1 transition-colors {extraClass}"
	aria-label="Copy to clipboard"
>
	{#if confirmed}
		<i class="fa-solid fa-check text-xs text-brand-green"></i>
	{:else}
		<i class="fa-regular fa-copy text-xs text-text-muted hover:text-white"></i>
	{/if}
</button>

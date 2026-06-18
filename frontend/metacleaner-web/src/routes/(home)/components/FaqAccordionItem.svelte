<script lang="ts">
	interface Props {
		question: string;
		answer: string;
	}

	const { question, answer }: Props = $props();

	let open = $state(false);

	function toggle() {
		open = !open;
	}
</script>

<div class="bg-navy-card rounded-2xl border border-border overflow-hidden">
	<button
		onclick={toggle}
		class="w-full flex items-center justify-between p-4 md:px-6 md:py-5 text-left hover:bg-navy-lighter/50 transition-colors"
	>
		<span class="text-sm md:text-base font-semibold text-white">{question}</span>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-xs md:text-sm transition-transform duration-200"
			class:rotate-180={open}
		></i>
	</button>
	{#if open}
		<div class="px-4 pb-4 md:px-6 md:pb-5">
			<p class="text-xs md:text-sm text-text-muted leading-relaxed">{answer}</p>
		</div>
	{/if}
</div>

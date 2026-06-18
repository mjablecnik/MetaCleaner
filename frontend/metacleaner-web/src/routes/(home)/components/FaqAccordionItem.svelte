<script lang="ts">
	interface Props {
		question: string;
		answer: string;
		size?: 'desktop' | 'mobile';
	}

	const { question, answer, size = 'desktop' }: Props = $props();

	let open = $state(false);

	function toggle() {
		open = !open;
	}

	const isMobile = $derived(size === 'mobile');
</script>

<div class="bg-navy-card rounded-2xl border border-border overflow-hidden">
	{#if isMobile}
		<button onclick={toggle} class="w-full flex items-center justify-between p-4 text-left">
			<span class="text-sm font-semibold text-white">{question}</span>
			<i
				class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform duration-300"
				class:rotate-180={open}
			></i>
		</button>
		{#if open}
			<div class="px-4 pb-4">
				<p class="text-xs text-text-muted leading-relaxed">{answer}</p>
			</div>
		{/if}
	{:else}
		<button
			onclick={toggle}
			class="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-navy-lighter/50 transition-colors"
		>
			<span class="font-semibold text-white">{question}</span>
			<i
				class="fa-solid fa-chevron-down text-text-muted transition-transform duration-200"
				class:rotate-180={open}
			></i>
		</button>
		{#if open}
			<div class="px-6 pb-5">
				<p class="text-sm text-text-muted leading-relaxed">{answer}</p>
			</div>
		{/if}
	{/if}
</div>

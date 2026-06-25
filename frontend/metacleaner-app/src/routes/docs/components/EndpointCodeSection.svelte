<script lang="ts">
	import CodeBlock from '$lib/shared/elements/CodeBlock.svelte';

	interface Props {
		label: string;
		code: string;
		class?: string;
	}

	let { label, code, class: extraClass = 'mb-5' }: Props = $props();
</script>

<div class={extraClass}>
	<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">{label}</p>
	<CodeBlock {code} />
</div>

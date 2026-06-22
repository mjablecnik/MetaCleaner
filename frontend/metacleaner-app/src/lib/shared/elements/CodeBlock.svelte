<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	interface Props {
		code: string;
		class?: string;
	}

	const { code, class: extraClass = '' }: Props = $props();
</script>

<div class="relative rounded-lg border border-navy-lighter {extraClass}" style="background:#080f1e">
	<div class="absolute right-2 top-2 z-10">
		<CopyButton text={code} />
	</div>
	<pre
		class="overflow-x-auto whitespace-pre p-4 pr-10 font-mono text-sm leading-relaxed text-white">{code}</pre>
</div>

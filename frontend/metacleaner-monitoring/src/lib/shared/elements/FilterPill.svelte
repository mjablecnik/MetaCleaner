<script lang="ts">
	interface Props {
		label: string;
		active: boolean;
		onclick: () => void;
		activeClass?: string;
		class?: string;
	}

	let {
		label,
		active,
		onclick,
		activeClass = 'bg-primary/20 text-primary',
		class: extraClass = ''
	}: Props = $props();
</script>

<button
	class="px-3 py-1.5 text-xs font-medium transition-colors {active
		? activeClass
		: 'bg-transparent text-textSec hover:bg-surface'} {extraClass}"
	{onclick}
>
	{label}
</button>

<script lang="ts">
	interface Tab {
		key: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		active: string;
		onchange: (key: string) => void;
		class?: string;
	}

	let { tabs, active, onchange, class: extraClass = '' }: Props = $props();
</script>

<div class="flex items-center gap-1 bg-background rounded-lg p-1 {extraClass}">
	{#each tabs as tab (tab.key)}
		<button
			class="flex-1 py-2 text-xs font-medium rounded-md transition-all {active === tab.key
				? 'bg-surface text-textMain'
				: 'text-textSec'}"
			onclick={() => onchange(tab.key)}
		>
			{tab.label}
		</button>
	{/each}
</div>

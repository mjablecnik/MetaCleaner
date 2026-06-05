<script lang="ts">
	interface Props {
		label: string;
		icon?: string;
		active?: boolean;
		onclick?: () => void;
		class?: string;
	}

	const { label, icon, active = false, onclick, class: extraClass = '' }: Props = $props();

	const classes = $derived(
		[
			'text-xs font-semibold px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all',
			active ? 'bg-brand-blue text-white border-brand-blue' : 'border-gray-700 text-text-muted',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<button {onclick} class={classes}>
	{#if icon}<i class="{icon} mr-1"></i>{/if}{label}
</button>

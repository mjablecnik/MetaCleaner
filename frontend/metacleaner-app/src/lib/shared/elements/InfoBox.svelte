<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'blue' | 'green' | 'orange' | 'red';

	interface Props {
		variant: Variant;
		icon?: string;
		class?: string;
		children?: Snippet;
	}

	const { variant, icon, class: extraClass = '', children }: Props = $props();

	const variantMap: Record<Variant, { bg: string; border: string; icon: string }> = {
		blue: {
			bg: 'bg-brand-blue/[.08]',
			border: 'border-brand-blue/25',
			icon: 'text-brand-blue'
		},
		green: {
			bg: 'bg-brand-green/[.08]',
			border: 'border-brand-green/25',
			icon: 'text-brand-green'
		},
		orange: {
			bg: 'bg-brand-orange/[.08]',
			border: 'border-brand-orange/25',
			icon: 'text-brand-orange'
		},
		red: {
			bg: 'bg-brand-red/[.08]',
			border: 'border-brand-red/25',
			icon: 'text-brand-red'
		}
	};

	const v = $derived(variantMap[variant] ?? variantMap.blue);
</script>

<div class="flex gap-3 rounded-[10px] border p-4 {v.bg} {v.border} {extraClass}">
	{#if icon}
		<i class="fa-solid {icon} mt-0.5 flex-shrink-0 {v.icon}"></i>
	{/if}
	<div class="text-sm text-text-muted">
		{@render children?.()}
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { chartColors } from '$lib/theme/chartColors';
	import type { ServiceCard } from '$lib/repositories/availabilityRepository';

	interface Props {
		card: ServiceCard;
		variant?: 'desktop' | 'mobile';
	}

	let { card, variant = 'desktop' }: Props = $props();

	const containerId = `bar-${card.key}${variant === 'mobile' ? '-m' : ''}`;
	const isMobile = variant === 'mobile';
	const valueClass = $derived(card.status === 'degraded' ? 'text-secondary' : 'text-success');

	onMount(() => {
		const container = document.getElementById(containerId);
		if (!container) return;
		const days = 90;
		for (let i = 0; i < days; i++) {
			const block = document.createElement('div');
			if (isMobile) {
				block.style.flex = '1';
				block.style.minWidth = '2px';
				block.style.height = '20px';
				block.style.borderRadius = '2px';
				block.style.flexShrink = '0';
			} else {
				block.style.width = '12px';
				block.style.height = '28px';
				block.style.borderRadius = '3px';
				block.style.flexShrink = '0';
			}
			block.style.cursor = 'pointer';
			let color: string = chartColors.primary;
			let title = `Dne ${days - i}: Provoz`;
			if (card.downDays && card.downDays.includes(i)) {
				color = chartColors.error;
				title = `Dne ${days - i}: Výpadek`;
			} else if (card.degradedDays && card.degradedDays.includes(i)) {
				color = chartColors.secondary;
				title = `Dne ${days - i}: Degradace`;
			}
			block.style.backgroundColor = color;
			block.title = title;
			container.appendChild(block);
		}
	});
</script>

{#if isMobile}
	<div>
		<div class="flex items-center justify-between mb-1.5">
			<div class="flex items-center gap-1.5">
				<i class="fa-solid {card.icon} text-textSec text-xs"></i>
				<span class="text-xs font-medium text-textMain">{card.name}</span>
			</div>
			<span class="text-xs font-semibold {valueClass}">{card.uptimeDisplay}%</span>
		</div>
		<div class="flex gap-px items-end w-full overflow-hidden h-5" id={containerId}></div>
		<div class="flex justify-between mt-1">
			<span class="text-xs text-textSec">90d</span>
			<span class="text-xs text-textSec">dnes</span>
		</div>
	</div>
{:else}
	<div>
		<div class="flex items-center justify-between mb-2">
			<div class="flex items-center gap-2">
				<i class="fa-solid {card.icon} text-textSec text-xs"></i>
				<span class="text-sm font-medium text-textMain">{card.name} ({card.provider})</span>
			</div>
			<span class="text-sm font-semibold {valueClass}"
				>{card.uptimeDisplay}% uptime</span
			>
		</div>
		<div class="flex gap-0.5 items-end" id={containerId}></div>
		<div class="flex justify-between mt-1">
			<span class="text-xs text-textSec">90 dní zpět</span>
			<span class="text-xs text-textSec">dnes</span>
		</div>
	</div>
{/if}

<script lang="ts">
	import { onMount } from 'svelte';
	import { chartColors } from '$lib/theme/chartColors';
	import type { ServiceCard } from '$lib/repositories/availabilityRepository';

	interface Props {
		card: ServiceCard;
		variant?: 'desktop' | 'mobile';
	}

	let { card, variant = 'desktop' }: Props = $props();

	const statusBadge: Record<string, { bg: string; label: string }> = {
		online: { bg: 'bg-success/10 text-success border border-success/20', label: 'ONLINE' },
		degraded: {
			bg: 'bg-secondary/10 text-secondary border border-secondary/20',
			label: 'DEGRADED'
		},
		offline: { bg: 'bg-error/10 text-error border border-error/20', label: 'OFFLINE' }
	};

	const statusBar: Record<string, { barClass: string }> = {
		online: { barClass: 'bg-success' },
		degraded: { barClass: 'bg-secondary' },
		offline: { barClass: 'bg-error' }
	};

	const statusDot: Record<string, { dot: string; pulse: boolean }> = {
		online: { dot: 'bg-success', pulse: true },
		degraded: { dot: 'bg-secondary', pulse: false },
		offline: { dot: 'bg-error', pulse: false }
	};

	const badge = $derived(statusBadge[card.status]);
	const bar = $derived(statusBar[card.status]);
	const dot = $derived(statusDot[card.status]);

	const barContainerId = $derived(`bar-${card.key}${variant === 'mobile' ? '-m' : ''}`);

	onMount(() => {
		const container = document.getElementById(barContainerId);
		if (!container) return;
		const days = 90;
		const isMobile = variant === 'mobile';
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

{#if variant === 'desktop'}
	<div class="bg-card border border-surface rounded-xl p-5 relative overflow-hidden">
		<div class="absolute top-0 left-0 w-1 h-full {bar.barClass} rounded-l-xl"></div>
		<div class="flex justify-between items-start mb-3 pl-1">
			<div>
				<p class="text-xs text-textSec uppercase tracking-wider font-semibold">{card.name}</p>
				<p class="text-xs text-textSec mt-0.5">{card.provider}</p>
			</div>
			<span class="px-2 py-0.5 text-xs font-semibold rounded-full {badge.bg}">{badge.label}</span>
		</div>
		<div class="pl-1">
			<span class="text-4xl font-bold text-textMain"
				>{card.uptimeDisplay}<span class="text-2xl">%</span></span
			>
			<p class="text-xs text-textSec mt-2">Posledních 30 dní</p>
			<div class="mt-3 h-1.5 w-full bg-surface rounded-full overflow-hidden">
				<div class="h-full {bar.barClass} rounded-full" style="width:{card.uptimeDisplay}%"></div>
			</div>
			<div class="flex justify-between mt-1">
				<span class="text-xs text-textSec">{card.outageLabel}</span>
				{#if card.trendPositive}
					<span class="text-xs text-success">↑ {card.trend}</span>
				{:else}
					<span class="text-xs text-error">↓ {card.trend}</span>
				{/if}
			</div>
			<div class="flex gap-0.5 items-end mt-3" id={barContainerId}></div>
		</div>
	</div>
{:else}
	<div class="bg-card border border-surface rounded-xl p-4 relative overflow-hidden">
		<div class="absolute top-0 left-0 w-1 h-full {bar.barClass} rounded-l-xl"></div>
		<div class="pl-1">
			<div class="flex items-start justify-between mb-2">
				<div>
					<p class="text-xs text-textSec uppercase tracking-wider font-semibold leading-tight">
						{card.name}
					</p>
					<p class="text-xs text-textSec">{card.provider.split(' /')[0]}</p>
				</div>
				<span
					class="w-2 h-2 rounded-full {dot.dot} {dot.pulse
						? 'animate-pulse'
						: ''} mt-1 flex-shrink-0"
				></span>
			</div>
			<span class="text-2xl font-bold text-textMain"
				>{card.uptimeDisplay}<span class="text-base">%</span></span
			>
			<div class="mt-2 h-1.5 w-full bg-surface rounded-full overflow-hidden">
				<div class="h-full {bar.barClass} rounded-full" style="width:{card.uptimeDisplay}%"></div>
			</div>
			<div class="flex justify-between mt-1.5">
				<span class="text-xs text-textSec">{card.outageLabel}</span>
				{#if card.trendPositive}
					<span class="text-xs text-success">↑ {card.trend}</span>
				{:else}
					<span class="text-xs text-error">↓ {card.trend}</span>
				{/if}
			</div>
			<div class="flex gap-px items-end w-full overflow-hidden h-5 mt-2" id={barContainerId}></div>
		</div>
	</div>
{/if}

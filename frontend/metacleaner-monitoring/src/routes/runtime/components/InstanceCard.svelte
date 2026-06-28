<script lang="ts">
	import { t } from '$lib/i18n';
	import type { MachineInstance } from '$lib/repositories/runtimeRepository';

	interface Props {
		machine: MachineInstance;
		variant?: 'desktop' | 'mobile';
	}

	let { machine: m, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="p-4 rounded-xl bg-surface/40 border border-border/40">
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-3">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				<span class="text-textMain font-medium text-sm font-mono">{m.name} · {m.displayId}</span>
				<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">{m.status}</span>
			</div>
			<span class="text-xs text-textSec">shared-cpu-2x · {m.ramTotalDisplay} GB RAM</span>
		</div>
		<div class="grid grid-cols-3 gap-3">
			<div>
				<div class="text-xs text-textSec mb-1">CPU</div>
				<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
					<div class="h-full {m.cpuClass} rounded-full" style="width:{m.cpuPercent}%"></div>
				</div>
				<div class="text-xs {m.cpuWarning ? 'text-secondary' : 'text-textMain'} mt-1">
					{m.cpuDisplay}
				</div>
			</div>
			<div>
				<div class="text-xs text-textSec mb-1">RAM</div>
				<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
					<div class="h-full bg-blue rounded-full" style="width:{m.ramBarWidth}"></div>
				</div>
				<div class="text-xs text-textMain mt-1">{m.ramDisplay}</div>
			</div>
			<div>
				<div class="text-xs text-textSec mb-1">{t('common_labels_uptime')}</div>
				<div class="text-xs text-textMain mt-1 font-mono">{m.uptime}</div>
			</div>
		</div>
	</div>
{:else}
	<div
		class="p-4 rounded-xl bg-surface/40 border {m.cpuWarning
			? 'border-secondary/20'
			: 'border-border/40'}"
	>
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-2">
				<div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
				<span class="text-textMain font-medium text-xs font-mono">{m.name} · {m.displayId}</span>
			</div>
			<span class="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">{m.status}</span>
		</div>
		<p class="text-xs text-textSec mb-3">shared-cpu-2x · {m.ramTotalDisplay} GB RAM</p>
		<div class="grid grid-cols-3 gap-3">
			<div>
				<div class="text-xs text-textSec mb-1">CPU</div>
				<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
					<div class="h-full {m.cpuClass} rounded-full" style="width:{m.cpuPercent}%"></div>
				</div>
				<div class="text-xs {m.cpuWarning ? 'text-secondary' : 'text-textMain'} mt-1">
					{m.cpuDisplay}
				</div>
			</div>
			<div>
				<div class="text-xs text-textSec mb-1">RAM</div>
				<div class="w-full h-1.5 bg-surface-deep rounded-full overflow-hidden">
					<div class="h-full bg-blue rounded-full" style="width:{m.ramBarWidth}"></div>
				</div>
				<div class="text-xs text-textMain mt-1">{m.ramDisplay}</div>
			</div>
			<div>
				<div class="text-xs text-textSec mb-1">{t('common_labels_uptime')}</div>
				<div class="text-xs text-textMain mt-1 font-mono">{m.uptime}</div>
			</div>
		</div>
	</div>
{/if}

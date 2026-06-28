<script lang="ts">
	import type { DeployEntry } from '$lib/repositories/runtimeRepository';

	interface Props {
		deploy: DeployEntry;
		variant?: 'desktop' | 'mobile';
		showDivider?: boolean;
	}

	let { deploy: d, variant = 'desktop', showDivider = false }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="flex items-start gap-3">
		<div
			class="mt-1 w-7 h-7 rounded-lg {d.iconClass} flex items-center justify-center flex-shrink-0"
		>
			<i
				class="fa-solid {d.icon} {d.status === 'failed'
					? 'text-error'
					: d.status === 'success'
						? 'text-success'
						: 'text-secondary'} text-xs"
			></i>
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between">
				<span class="text-textMain text-sm font-semibold">{d.version}</span>
				<span class="text-xs text-textSec">{d.timestamp}</span>
			</div>
			<p class="text-xs {d.status === 'failed' ? 'text-error' : 'text-textSec'} mt-0.5 truncate">
				{d.commitMessage}
			</p>
			<p class="text-xs text-textSec mt-0.5">{d.subtext}</p>
		</div>
	</div>
{:else}
	<div class="flex items-start gap-3 py-2 {showDivider ? 'border-b border-surface/60' : ''}">
		<div
			class="mt-0.5 w-7 h-7 rounded-lg {d.iconClass} flex items-center justify-center flex-shrink-0"
		>
			<i
				class="fa-solid {d.icon} {d.status === 'failed'
					? 'text-error'
					: d.status === 'success'
						? 'text-success'
						: 'text-secondary'} text-xs"
			></i>
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between">
				<span class="text-textMain text-sm font-semibold">{d.version}</span>
				<span class="text-xs text-textSec">{d.timestamp}</span>
			</div>
			<p class="text-xs {d.status === 'failed' ? 'text-error' : 'text-textSec'} mt-0.5 truncate">
				{d.commitMessage}
			</p>
			<p class="text-xs text-textSec mt-0.5">{d.subtext}</p>
		</div>
	</div>
{/if}

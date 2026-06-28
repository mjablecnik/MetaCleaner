<script lang="ts">
	import type { DeployEntry } from '$lib/repositories/runtimeRepository';

	interface Props {
		deploy: DeployEntry;
		variant?: 'desktop' | 'mobile';
		showDivider?: boolean;
	}

	let { deploy: d, variant = 'desktop', showDivider = false }: Props = $props();

	function appBadgeClass(app: string): string {
		if (app === 'metacleaner-server') return 'bg-[#3b82f6]/15 text-[#3b82f6]';
		if (app === 'metacleaner-web') return 'bg-success/15 text-success';
		if (app === 'metacleaner-app') return 'bg-[#8b5cf6]/15 text-[#8b5cf6]';
		return 'bg-surface/60 text-textSec';
	}
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
				<div class="flex items-center gap-1.5 min-w-0">
					<span class="text-textMain text-sm font-semibold">{d.version}</span>
					<span class="text-xs px-1.5 py-0.5 rounded-md {appBadgeClass(d.app)}">{d.app}</span>
				</div>
				<span class="text-xs text-textSec flex-shrink-0 ml-2">{d.timestamp}</span>
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
				<div class="flex items-center gap-1.5 min-w-0">
					<span class="text-textMain text-sm font-semibold">{d.version}</span>
					<span class="text-xs px-1.5 py-0.5 rounded-md {appBadgeClass(d.app)}">{d.app}</span>
				</div>
				<span class="text-xs text-textSec flex-shrink-0 ml-2">{d.timestamp}</span>
			</div>
			<p class="text-xs {d.status === 'failed' ? 'text-error' : 'text-textSec'} mt-0.5 truncate">
				{d.commitMessage}
			</p>
			<p class="text-xs text-textSec mt-0.5">{d.subtext}</p>
		</div>
	</div>
{/if}

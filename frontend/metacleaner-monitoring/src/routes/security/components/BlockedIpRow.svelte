<script lang="ts">
	import { t } from '$lib/i18n';
	import type { BlockedIp } from '$lib/repositories/securityRepository';

	interface Props {
		ip: BlockedIp;
		variant?: 'desktop' | 'mobile';
	}

	let { ip, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div
		class="flex items-center gap-3 p-3 rounded-lg bg-surface/40 border border-border/40 hover:border-border transition-colors"
	>
		<div class="w-7 h-7 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
			<i class="fa-solid fa-ban {ip.iconClass} text-xs"></i>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-textMain text-sm font-mono">{ip.ip}</p>
			<p class="text-xs text-textSec">{ip.country} · {ip.reason}</p>
		</div>
		<div class="flex items-center gap-2 flex-shrink-0">
			<span class="px-1.5 py-0.5 {ip.blockTypeClass} text-xs rounded font-medium"
				>{t(ip.blockTypeKey)}</span
			>
			<span class="text-xs text-textSec">{ip.blockedAt}</span>
		</div>
	</div>
{:else}
	<div class="flex items-center gap-3 p-4">
		<div class="w-7 h-7 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
			<i class="fa-solid fa-ban {ip.iconClass} text-xs"></i>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-textMain text-sm font-mono">{ip.ip}</p>
			<p class="text-xs text-textSec">{ip.country} · {ip.reason}</p>
		</div>
		<div class="flex flex-col items-end gap-1">
			<span class="px-1.5 py-0.5 {ip.blockTypeClass} text-xs rounded font-medium"
				>{t(ip.blockTypeKey)}</span
			>
			<span class="text-xs text-textSec">{ip.blockedAt}</span>
		</div>
	</div>
{/if}

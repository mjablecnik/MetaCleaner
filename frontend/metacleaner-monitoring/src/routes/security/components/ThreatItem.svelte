<script lang="ts">
	import { t } from '$lib/i18n';
	import type { ActiveThreat } from '$lib/repositories/securityRepository';

	interface Props {
		threat: ActiveThreat;
		variant?: 'desktop' | 'mobile';
	}

	let { threat, variant = 'desktop' }: Props = $props();
</script>

{#if variant === 'desktop'}
	<div class="flex items-start gap-4 p-4 rounded-xl {threat.bgClass} border {threat.borderClass}">
		<div class="flex-shrink-0 mt-0.5">
			<div class="w-9 h-9 rounded-lg {threat.iconBg} flex items-center justify-center">
				<i class="fa-solid {threat.icon} {threat.iconClass} text-sm"></i>
			</div>
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<p class="text-textMain text-sm font-semibold">{threat.title}</p>
				<span class="px-1.5 py-0.5 {threat.severityClass} text-xs rounded font-medium"
					>{t(threat.severityKey)}</span
				>
			</div>
			<p class="text-xs text-textSec">IP: {threat.ip} · Původ: {threat.origin} · {threat.detail}</p>
			<p class="text-xs text-textSec mt-0.5">
				Endpoint: {threat.endpoint} · Agent: {threat.agentOrNote}
			</p>
		</div>
		<div class="flex-shrink-0 flex flex-col gap-2 items-end">
			<div class="{threat.iconClass} font-bold text-xs whitespace-nowrap">{threat.time} – aktivní</div>
			<button class="px-3 py-1 {threat.actionClass} text-xs font-medium rounded-lg transition-colors"
				>{t(threat.actionKey)}</button
			>
		</div>
	</div>
{:else}
	<div class="p-4 {threat.bgClass}">
		<div class="flex items-start gap-3">
			<div
				class="w-9 h-9 rounded-lg {threat.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5"
			>
				<i class="fa-solid {threat.icon} {threat.iconClass} text-sm"></i>
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 flex-wrap mb-1">
					<p class="text-textMain text-sm font-semibold leading-tight">{threat.title}</p>
					<span class="px-1.5 py-0.5 {threat.severityClass} text-xs rounded font-medium"
						>{t(threat.severityKey)}</span
					>
				</div>
				<p class="text-xs text-textSec">IP: {threat.ip} · {threat.origin} · {threat.detail}</p>
				<p class="text-xs text-textSec mt-0.5 font-mono">{threat.endpoint}</p>
				<div class="flex items-center justify-between mt-3">
					<span class="{threat.iconClass} font-bold text-xs">{threat.time} – aktivní</span>
					<button
						class="px-4 py-2 {threat.actionClass} text-xs font-medium rounded-lg transition-colors min-h-[36px]"
						>{t(threat.actionKey)}</button
					>
				</div>
			</div>
		</div>
	</div>
{/if}

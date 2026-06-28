<script lang="ts">
	import type { HealthCheck } from '$lib/repositories/availabilityRepository';

	interface Props {
		healthCheck: HealthCheck;
	}

	let { healthCheck: hc }: Props = $props();

	const statusDot: Record<string, { dot: string; text: string; pulse: boolean }> = {
		online: { dot: 'bg-success', text: 'text-success', pulse: true },
		degraded: { dot: 'bg-secondary', text: 'text-secondary', pulse: false },
		offline: { dot: 'bg-error', text: 'text-error', pulse: false }
	};

	const dot = $derived(statusDot[hc.status]);
</script>

<div
	class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border {hc.status === 'degraded'
		? 'border-secondary/20'
		: 'border-border/40'}"
	style="min-height:52px"
>
	<div class="flex items-center gap-3">
		<div
			class="w-2.5 h-2.5 rounded-full {dot.dot} {dot.pulse ? 'animate-pulse' : ''} flex-shrink-0"
		></div>
		<div>
			<p class="text-sm font-medium text-textMain">{hc.endpoint}</p>
			<p class="text-xs text-textSec">{hc.service}</p>
		</div>
	</div>
	<div class="text-right">
		<p class="text-sm font-semibold {dot.text}">{hc.statusCode}</p>
		<p class="text-xs text-textSec">{hc.latencyMs}ms</p>
	</div>
</div>

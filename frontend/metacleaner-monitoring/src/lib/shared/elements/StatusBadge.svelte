<script lang="ts">
	type Status = 'online' | 'degraded' | 'offline' | 'active' | 'resolved' | 'critical' | 'warning' | 'info';

	interface Props {
		status: Status;
		label?: string;
		pulse?: boolean;
	}

	let { status, label, pulse = false }: Props = $props();

	const statusConfig: Record<Status, { classes: string; defaultLabel: string }> = {
		online: { classes: 'bg-success/10 text-success border-success/20', defaultLabel: 'ONLINE' },
		degraded: { classes: 'bg-secondary/10 text-secondary border-secondary/20', defaultLabel: 'DEGRADED' },
		offline: { classes: 'bg-error/10 text-error border-error/20', defaultLabel: 'OFFLINE' },
		active: { classes: 'bg-secondary/10 text-secondary border-secondary/20', defaultLabel: 'ACTIVE' },
		resolved: { classes: 'bg-success/10 text-success border-success/20', defaultLabel: 'RESOLVED' },
		critical: { classes: 'bg-error/10 text-error border-error/20', defaultLabel: 'CRITICAL' },
		warning: { classes: 'bg-secondary/10 text-secondary border-secondary/20', defaultLabel: 'WARNING' },
		info: { classes: 'bg-blue/10 text-blue border-blue/20', defaultLabel: 'INFO' }
	};

	const { classes, defaultLabel } = $derived(statusConfig[status]);
	const displayLabel = $derived(label ?? defaultLabel);
</script>

<span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border {classes}">
	{#if pulse}
		<span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
	{/if}
	{displayLabel}
</span>

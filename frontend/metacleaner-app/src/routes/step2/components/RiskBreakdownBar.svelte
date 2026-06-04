<script lang="ts">
	type Severity = 'critical' | 'high' | 'medium' | 'low';

	interface Props {
		icon: string;
		label: string;
		severity: Severity;
		severityLabel: string;
		value: number;
	}

	const { icon, label, severity, severityLabel, value }: Props = $props();

	const clampedValue = $derived(Math.min(100, Math.max(0, value)));

	const severityTextClass: Record<Severity, string> = {
		critical: 'text-brand-red',
		high: 'text-brand-orange',
		medium: 'text-brand-orange',
		low: 'text-text-muted',
	};

	const iconColorClass: Record<Severity, string> = {
		critical: 'text-brand-red',
		high: 'text-brand-orange',
		medium: 'text-brand-blue',
		low: 'text-text-muted',
	};

	const barClass: Record<Severity, string> = {
		critical: 'bg-gradient-to-r from-brand-red to-red-400',
		high: 'bg-brand-orange',
		medium: 'bg-gradient-to-r from-brand-orange to-yellow-400',
		low: 'bg-gray-500',
	};
</script>

<div class="flex flex-col gap-1.5">
	<div class="flex items-center justify-between text-xs">
		<span class="flex items-center gap-1.5 text-white font-medium">
			<i class="{icon} {iconColorClass[severity]} text-[10px]"></i>{label}
		</span>
		<span class="{severityTextClass[severity]} font-bold">{severityLabel}</span>
	</div>
	<div class="w-full bg-navy-lighter rounded-full h-2">
		<div class="h-2 rounded-full {barClass[severity]}" style="width:{clampedValue}%"></div>
	</div>
</div>

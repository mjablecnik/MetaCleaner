<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		label: string;
		value: number;
		maxValue: number;
		color: 'red' | 'orange' | 'blue' | 'green';
		icon: string;
	}

	let { label, value, maxValue, color, icon }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const percentage = $derived(maxValue > 0 ? Math.round((value / maxValue) * 100) : 0);

	const colorMap: Record<string, { text: string; bar: string }> = {
		red: { text: 'text-brand-red', bar: 'bg-brand-red' },
		orange: { text: 'text-brand-orange', bar: 'bg-brand-orange' },
		blue: { text: 'text-brand-blue', bar: 'bg-brand-blue' },
		green: { text: 'text-brand-green', bar: 'bg-brand-green' }
	};

	const classes = $derived(colorMap[color]);
</script>

<div>
	<div class="mb-1 flex justify-between">
		<span class="flex items-center gap-1 text-xs text-text-muted lg:gap-1.5">
			<i class="fa-solid {icon} {classes.text} text-[10px]"></i>{label}
		</span>
		<span class="text-xs font-bold {classes.text}"
			>{value} {tx('report.chart.fields')} · {percentage}%</span
		>
	</div>
	<div class="h-2 w-full rounded-full bg-navy-main/80">
		<div class="h-2 rounded-full {classes.bar}" style="width:{percentage}%"></div>
	</div>
</div>

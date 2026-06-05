<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ReportDetail, ReportIconColor } from '$lib/repositories/reportRepository';
	import ChartBar from '../components/ChartBar.svelte';

	interface Props {
		reportDetail: ReportDetail | null;
	}

	let { reportDetail }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const chartStyles: Record<
		string,
		{ dot: string; text: string; color: 'red' | 'orange' | 'blue'; icon: string; txKey: string }
	> = {
		GPS: {
			dot: 'bg-brand-red',
			text: 'text-brand-red',
			color: 'red',
			icon: 'fa-location-dot',
			txKey: 'report.chart.gpsData'
		},
		EXIF: {
			dot: 'bg-brand-orange',
			text: 'text-brand-orange',
			color: 'orange',
			icon: 'fa-camera',
			txKey: 'report.chart.exifData'
		},
		XMP: {
			dot: 'bg-brand-blue',
			text: 'text-brand-blue',
			color: 'blue',
			icon: 'fa-tag',
			txKey: 'report.chart.xmpData'
		}
	};

	const iconColors: Record<ReportIconColor, { bg: string; border: string; text: string }> = {
		green: { bg: 'bg-brand-green/10', border: 'border-brand-green/20', text: 'text-brand-green' },
		blue: { bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', text: 'text-brand-blue' },
		orange: {
			bg: 'bg-brand-orange/10',
			border: 'border-brand-orange/20',
			text: 'text-brand-orange'
		}
	};

	const fileBarColors: Record<ReportIconColor, string> = {
		green: 'from-brand-green to-green-400',
		blue: 'from-brand-blue to-blue-400',
		orange: 'from-brand-orange to-orange-400'
	};
</script>

<div class="fade-in-up grid grid-cols-1 gap-4 delay-2 lg:grid-cols-2">
	<!-- Metadata Distribution -->
	<div class="rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6">
		<h3 class="mb-0.5 text-base font-semibold text-white lg:mb-1 lg:text-lg">
			{tx('report.chart.distributionTitle')}
		</h3>
		<p class="mb-4 text-[11px] text-text-muted lg:text-xs">{tx('report.chart.distributionDesc')}</p>

		<!-- Legend grid -->
		<div class="mb-4 grid grid-cols-3 gap-2">
			{#each reportDetail?.chartData ?? [] as point (point.label)}
				{@const style = chartStyles[point.label] ?? chartStyles.XMP}
				<div
					class="flex flex-col items-center gap-1 rounded-xl border border-gray-800 bg-navy-main/60 p-3"
				>
					<div class="mb-1 flex items-center gap-1 lg:gap-1.5">
						<div class="h-2.5 w-2.5 rounded-full lg:h-3 lg:w-3 {style.dot}"></div>
						<span class="text-[9px] font-semibold text-text-muted uppercase lg:text-[10px]"
							>{point.label}</span
						>
					</div>
					<p class="text-lg font-black lg:text-xl {style.text}">{point.fields}</p>
					<p class="text-[9px] text-text-muted lg:text-[10px]">{tx('report.chart.fields')}</p>
				</div>
			{/each}
		</div>

		<!-- Bar breakdown -->
		<div class="flex flex-col gap-2.5">
			{#each reportDetail?.chartData ?? [] as point (point.label)}
				{@const style = chartStyles[point.label] ?? chartStyles.XMP}
				<ChartBar
					label={tx(style.txKey)}
					value={point.fields}
					maxValue={reportDetail?.fieldsRemoved ?? 100}
					color={style.color}
					icon={style.icon}
				/>
			{/each}
		</div>

		<div class="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
			<span class="text-xs text-text-muted">{tx('report.chart.totalRemoved')}</span>
			<span class="text-sm font-black text-white"
				>{reportDetail?.fieldsRemoved ?? ''} {tx('report.chart.fields')}</span
			>
		</div>
	</div>

	<!-- Per-File Breakdown -->
	<div class="rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6">
		<h3 class="mb-0.5 text-base font-semibold text-white lg:mb-1 lg:text-lg">
			{tx('report.chart.perFileTitle')}
		</h3>
		<p class="mb-3 text-[11px] text-text-muted lg:mb-4 lg:text-xs">
			{tx('report.chart.perFileDesc')}
		</p>
		<div class="flex flex-col gap-2.5 lg:gap-3">
			{#each reportDetail?.files ?? [] as file (file.name)}
				{@const colors = iconColors[file.iconColor]}
				{@const barGrad = fileBarColors[file.iconColor]}
				<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3">
					<div class="mb-2 flex items-center gap-2.5 lg:gap-3">
						<div
							class="h-7 w-7 rounded-lg {colors.bg} {colors.border} flex flex-shrink-0 items-center justify-center"
						>
							<i
								class="fa-solid {file.type === 'video'
									? 'fa-video'
									: 'fa-image'} {colors.text} text-[11px]"
							></i>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-semibold text-white">{file.name}</p>
							<p class="text-[10px] text-text-muted">{file.format} · {file.device}</p>
						</div>
						<span
							class="text-sm font-black {file.iconColor === 'orange'
								? 'text-brand-orange'
								: 'text-white'}">{file.fieldsRemoved}</span
						>
					</div>
					<div class="mb-2 h-1.5 w-full rounded-full bg-navy-card lg:h-2">
						<div
							class="h-1.5 rounded-full bg-gradient-to-r lg:h-2 {barGrad}"
							style="width:{file.barWidthPercent}%"
						></div>
					</div>
					<div class="flex flex-wrap gap-1.5">
						<span
							class="rounded border border-brand-red/20 bg-brand-red/10 px-1.5 py-0.5 text-[10px] text-brand-red"
							>GPS ×{file.metadata.gpsFields.length}</span
						>
						<span
							class="rounded border border-brand-orange/20 bg-brand-orange/10 px-1.5 py-0.5 text-[10px] text-brand-orange"
							>EXIF ×{file.metadata.exifFields.length}</span
						>
						<span
							class="rounded border border-brand-blue/20 bg-brand-blue/10 px-1.5 py-0.5 text-[10px] text-brand-blue"
							>XMP ×{file.metadata.xmpFields.length}</span
						>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

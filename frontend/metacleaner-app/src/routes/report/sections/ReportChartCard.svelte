<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ReportDetail, ReportIconColor } from '$lib/repositories/reportRepository';
	import ChartBar from '../components/ChartBar.svelte';

	interface Props {
		reportDetail: ReportDetail | null;
	}

	let { reportDetail }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const chartStyles: Record<string, { dot: string; text: string; color: 'red' | 'orange' | 'blue'; icon: string; txKey: string }> = {
		GPS: { dot: 'bg-brand-red', text: 'text-brand-red', color: 'red', icon: 'fa-location-dot', txKey: 'report.chart.gpsData' },
		EXIF: { dot: 'bg-brand-orange', text: 'text-brand-orange', color: 'orange', icon: 'fa-camera', txKey: 'report.chart.exifData' },
		XMP: { dot: 'bg-brand-blue', text: 'text-brand-blue', color: 'blue', icon: 'fa-tag', txKey: 'report.chart.xmpData' }
	};

	const iconColors: Record<ReportIconColor, { bg: string; border: string; text: string }> = {
		green: { bg: 'bg-brand-green/10', border: 'border-brand-green/20', text: 'text-brand-green' },
		blue: { bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', text: 'text-brand-blue' },
		orange: { bg: 'bg-brand-orange/10', border: 'border-brand-orange/20', text: 'text-brand-orange' }
	};

	const fileBarColors: Record<ReportIconColor, string> = {
		green: 'from-brand-green to-green-400',
		blue: 'from-brand-blue to-blue-400',
		orange: 'from-brand-orange to-orange-400'
	};
</script>

<div class="fade-in-up delay-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
	<!-- Metadata Distribution -->
	<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card">
		<h3 class="font-semibold text-base lg:text-lg text-white mb-0.5 lg:mb-1">{tx('report.chart.distributionTitle')}</h3>
		<p class="text-[11px] lg:text-xs text-text-muted mb-4">{tx('report.chart.distributionDesc')}</p>

		<!-- Legend grid -->
		<div class="grid grid-cols-3 gap-2 mb-4">
			{#each reportDetail?.chartData ?? [] as point}
				{@const style = chartStyles[point.label] ?? chartStyles.XMP}
				<div class="flex flex-col items-center gap-1 bg-navy-main/60 rounded-xl p-3 border border-gray-800">
					<div class="flex items-center gap-1 lg:gap-1.5 mb-1">
						<div class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full {style.dot}"></div>
						<span class="text-[9px] lg:text-[10px] text-text-muted font-semibold uppercase">{point.label}</span>
					</div>
					<p class="text-lg lg:text-xl font-black {style.text}">{point.fields}</p>
					<p class="text-[9px] lg:text-[10px] text-text-muted">{tx('report.chart.fields')}</p>
				</div>
			{/each}
		</div>

		<!-- Bar breakdown -->
		<div class="flex flex-col gap-2.5">
			{#each reportDetail?.chartData ?? [] as point}
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

		<div class="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
			<span class="text-xs text-text-muted">{tx('report.chart.totalRemoved')}</span>
			<span class="text-sm font-black text-white">{reportDetail?.fieldsRemoved ?? ''} {tx('report.chart.fields')}</span>
		</div>
	</div>

	<!-- Per-File Breakdown -->
	<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 shadow-card">
		<h3 class="font-semibold text-base lg:text-lg text-white mb-0.5 lg:mb-1">{tx('report.chart.perFileTitle')}</h3>
		<p class="text-[11px] lg:text-xs text-text-muted mb-3 lg:mb-4">{tx('report.chart.perFileDesc')}</p>
		<div class="flex flex-col gap-2.5 lg:gap-3">
			{#each reportDetail?.files ?? [] as file}
				{@const colors = iconColors[file.iconColor]}
				{@const barGrad = fileBarColors[file.iconColor]}
				<div class="bg-navy-main/60 rounded-xl p-3 border border-gray-800">
					<div class="flex items-center gap-2.5 lg:gap-3 mb-2">
						<div class="w-7 h-7 rounded-lg {colors.bg} {colors.border} flex items-center justify-center flex-shrink-0">
							<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {colors.text} text-[11px]"></i>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-xs font-semibold text-white truncate">{file.name}</p>
							<p class="text-[10px] text-text-muted">{file.format} · {file.device}</p>
						</div>
						<span class="text-sm font-black {file.iconColor === 'orange' ? 'text-brand-orange' : 'text-white'}">{file.fieldsRemoved}</span>
					</div>
					<div class="w-full h-1.5 lg:h-2 rounded-full bg-navy-card mb-2">
						<div class="h-1.5 lg:h-2 rounded-full bg-gradient-to-r {barGrad}" style="width:{file.barWidthPercent}%"></div>
					</div>
					<div class="flex gap-1.5 flex-wrap">
						<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red">GPS ×{file.metadata.gpsFields.length}</span>
						<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">EXIF ×{file.metadata.exifFields.length}</span>
						<span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 border border-brand-blue/20 text-brand-blue">XMP ×{file.metadata.xmpFields.length}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ReportFileDetail, ReportIconColor } from '$lib/repositories/reportRepository';
	import MetadataTable from './MetadataTable.svelte';

	interface Props {
		file: ReportFileDetail;
		open: boolean;
		onToggle: () => void;
	}

	let { file, open, onToggle }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const iconColors: Record<ReportIconColor, { bg: string; border: string; text: string }> = {
		green: { bg: 'bg-brand-green/10', border: 'border-brand-green/20', text: 'text-brand-green' },
		blue: { bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', text: 'text-brand-blue' },
		orange: { bg: 'bg-brand-orange/10', border: 'border-brand-orange/20', text: 'text-brand-orange' }
	};

	const metaSections = [
		{ key: 'gps' as const, icon: 'fa-location-dot', iconClass: 'text-brand-red', txKey: 'report.chart.gpsData' },
		{ key: 'exif' as const, icon: 'fa-camera', iconClass: 'text-brand-orange', txKey: 'report.chart.exifData' },
		{ key: 'xmp' as const, icon: 'fa-tag', iconClass: 'text-brand-blue', txKey: 'report.chart.xmpData' }
	];

	function getMetaFields(key: 'gps' | 'exif' | 'xmp') {
		if (key === 'gps') return file.metadata.gpsFields;
		if (key === 'exif') return file.metadata.exifFields;
		return file.metadata.xmpFields;
	}

	const colors = $derived(iconColors[file.iconColor]);
</script>

<div class="rounded-xl border border-brand-green/20 bg-navy-card lg:bg-navy-main/60 overflow-hidden shadow-card lg:shadow-none">
	<button
		onclick={onToggle}
		class="w-full flex items-center gap-3 px-4 py-3.5 lg:py-4 text-left hover:bg-navy-lighter/30 transition-colors"
	>
		<div class="w-9 h-9 rounded-lg {colors.bg} {colors.border} flex items-center justify-center flex-shrink-0">
			<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {colors.text} text-sm"></i>
		</div>
		<div class="flex-1 min-w-0">
			<!-- Mobile layout -->
			<div class="flex items-center gap-2 mb-0.5 lg:hidden">
				<p class="text-sm font-semibold text-white truncate">{file.name}</p>
				<span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0">{file.extension}</span>
			</div>
			<p class="text-[10px] text-text-muted lg:hidden">{file.sizeMB} MB · {file.device} · <span class="text-white font-semibold">{file.fieldsRemoved} {tx('report.chart.fields')}</span></p>
			<!-- Desktop layout -->
			<p class="hidden lg:block text-sm font-semibold text-white truncate">{file.name}</p>
			<p class="hidden lg:block text-[11px] text-text-muted">{file.sizeMB} MB · {file.format} · {file.device} · {file.fieldsRemoved} {tx('report.chart.fields')} {tx('report.files.removed')}</p>
		</div>
		<div class="hidden lg:flex items-center gap-2 flex-shrink-0">
			<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted">{file.extension}</span>
			{#if file.hasGps}
				<span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
			{/if}
			<div class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
				<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
			</div>
		</div>
		<!-- Mobile: GPS + check -->
		<div class="flex lg:hidden items-center gap-2 flex-shrink-0">
			{#if file.hasGps}
				<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium">GPS</span>
			{/if}
			<div class="w-5 h-5 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
				<i class="fa-solid fa-check text-brand-green text-[9px]"></i>
			</div>
		</div>
		<i
			class="fa-solid fa-chevron-down text-text-muted text-xs transition-transform ml-1"
			style="transform: {open ? 'rotate(180deg)' : 'none'}"
		></i>
	</button>
	{#if open}
		<div class="border-t border-gray-800">
			<div class="p-4 flex flex-col gap-3">
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
					{#each metaSections as section}
						<div class="bg-navy-main/60 lg:bg-navy-card rounded-xl p-3 border border-gray-800">
							<p class="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
								<i class="fa-solid {section.icon} {section.iconClass}"></i> {tx(section.txKey)}
							</p>
							<MetadataTable fields={getMetaFields(section.key)} />
						</div>
					{/each}
				</div>
				<div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-green/5 border border-brand-green/20">
					<i class="fa-solid fa-circle-check text-brand-green text-sm"></i>
					<p class="text-xs text-brand-green font-medium">{tx('report.chart.totalRemoved')}: <strong>{file.fieldsRemoved} {tx('report.files.metadataFields')}</strong> · {tx('report.files.safeToShare')}</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
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
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const iconColors: Record<ReportIconColor, { bg: string; border: string; text: string }> = {
		green: { bg: 'bg-brand-green/10', border: 'border-brand-green/20', text: 'text-brand-green' },
		blue: { bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', text: 'text-brand-blue' },
		orange: {
			bg: 'bg-brand-orange/10',
			border: 'border-brand-orange/20',
			text: 'text-brand-orange'
		}
	};

	const metaSections = [
		{
			key: 'gps' as const,
			icon: 'fa-location-dot',
			iconClass: 'text-brand-red',
			txKey: 'report.chart.gpsData'
		},
		{
			key: 'exif' as const,
			icon: 'fa-camera',
			iconClass: 'text-brand-orange',
			txKey: 'report.chart.exifData'
		},
		{
			key: 'xmp' as const,
			icon: 'fa-tag',
			iconClass: 'text-brand-blue',
			txKey: 'report.chart.xmpData'
		}
	];

	function getMetaFields(key: 'gps' | 'exif' | 'xmp') {
		if (key === 'gps') return file.metadata.gpsFields;
		if (key === 'exif') return file.metadata.exifFields;
		return file.metadata.xmpFields;
	}

	const colors = $derived(iconColors[file.iconColor]);
</script>

<div
	class="overflow-hidden rounded-xl border border-brand-green/20 bg-navy-card shadow-card lg:bg-navy-main/60 lg:shadow-none"
>
	<button
		onclick={onToggle}
		class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-navy-lighter/30 lg:py-4"
	>
		<div
			class="h-9 w-9 rounded-lg {colors.bg} {colors.border} flex flex-shrink-0 items-center justify-center"
		>
			<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {colors.text} text-sm"
			></i>
		</div>
		<div class="min-w-0 flex-1">
			<!-- Mobile layout -->
			<div class="mb-0.5 flex items-center gap-2 lg:hidden">
				<p class="truncate text-sm font-semibold text-white">{file.name}</p>
				<span
					class="flex-shrink-0 rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase"
					>{file.extension}</span
				>
			</div>
			<p class="text-[10px] text-text-muted lg:hidden">
				{file.sizeMB} MB · {file.device} ·
				<span class="font-semibold text-white"
					>{file.fieldsRemoved} {tx('report.chart.fields')}</span
				>
			</p>
			<!-- Desktop layout -->
			<p class="hidden truncate text-sm font-semibold text-white lg:block">{file.name}</p>
			<p class="hidden text-[11px] text-text-muted lg:block">
				{file.sizeMB} MB · {file.format} · {file.device} · {file.fieldsRemoved}
				{tx('report.chart.fields')}
				{tx('report.files.removed')}
			</p>
		</div>
		<div class="hidden flex-shrink-0 items-center gap-2 lg:flex">
			<span
				class="rounded bg-navy-lighter px-2 py-0.5 text-[10px] font-bold text-text-muted uppercase"
				>{file.extension}</span
			>
			{#if file.hasGps}
				<span
					class="rounded-full border border-brand-red/20 bg-brand-red/10 px-2 py-0.5 text-[10px] font-medium text-brand-red"
					>GPS</span
				>
			{/if}
			<div
				class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
			>
				<i class="fa-solid fa-check text-[10px] text-brand-green"></i>
			</div>
		</div>
		<!-- Mobile: GPS + check -->
		<div class="flex flex-shrink-0 items-center gap-2 lg:hidden">
			{#if file.hasGps}
				<span
					class="rounded-full border border-brand-red/20 bg-brand-red/10 px-1.5 py-0.5 text-[9px] font-medium text-brand-red"
					>GPS</span
				>
			{/if}
			<div
				class="flex h-5 w-5 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
			>
				<i class="fa-solid fa-check text-[9px] text-brand-green"></i>
			</div>
		</div>
		<i
			class="fa-solid fa-chevron-down ml-1 text-xs text-text-muted transition-transform"
			style="transform: {open ? 'rotate(180deg)' : 'none'}"
		></i>
	</button>
	{#if open}
		<div class="border-t border-gray-800">
			<div class="flex flex-col gap-3 p-4">
				<div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
					{#each metaSections as section (section.key)}
						<div class="rounded-xl border border-gray-800 bg-navy-main/60 p-3 lg:bg-navy-card">
							<p
								class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-text-muted uppercase"
							>
								<i class="fa-solid {section.icon} {section.iconClass}"></i>
								{tx(section.txKey)}
							</p>
							<MetadataTable fields={getMetaFields(section.key)} />
						</div>
					{/each}
				</div>
				<div
					class="flex items-center gap-2 rounded-lg border border-brand-green/20 bg-brand-green/5 px-3 py-2"
				>
					<i class="fa-solid fa-circle-check text-sm text-brand-green"></i>
					<p class="text-xs font-medium text-brand-green">
						{tx('report.chart.totalRemoved')}:
						<strong>{file.fieldsRemoved} {tx('report.files.metadataFields')}</strong>
						· {tx('report.files.safeToShare')}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

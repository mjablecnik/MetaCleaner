<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { formatSize } from '$lib/shared/utils/format';
	import type { QueuedFile } from '$lib/scanner/types';
	import type { FileMetadataResult } from '$lib/types/processing';

	interface Props {
		files: QueuedFile[];
		fileResults: FileMetadataResult[];
		onDownload: () => void;
		onViewReport: () => void;
	}

	const { files, fileResults, onDownload, onViewReport }: Props = $props();

	function getFileIcon(file: QueuedFile): string {
		if (file.type === 'video') return 'fa-video';
		return 'fa-image';
	}

	function getFileIconColor(file: QueuedFile): string {
		if (file.type === 'video') return 'text-brand-orange';
		const ext = file.extension.replaceAll('.', '').toLowerCase();
		if (ext === 'png') return 'text-brand-blue';
		return 'text-brand-green';
	}

	function getFileIconBorder(file: QueuedFile): string {
		if (file.type === 'video') return 'border-brand-orange/20 bg-brand-orange/10';
		const ext = file.extension.replaceAll('.', '').toLowerCase();
		if (ext === 'png') return 'border-brand-blue/20 bg-brand-blue/10';
		return 'border-brand-green/20 bg-brand-green/10';
	}

	function getExtBadge(file: QueuedFile): string {
		return file.extension.replaceAll('.', '').toUpperCase();
	}

	interface FileDisplayData {
		file: QueuedFile;
		result: FileMetadataResult | null;
	}

	const displayData = $derived<FileDisplayData[]>(
		(files ?? []).map((file, i) => ({
			file,
			result: fileResults[i] ?? null
		}))
	);
</script>

<div
	class="fade-in-up flex w-full flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-6 shadow-card delay-3"
>
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-white">{tx('step5.results.title')}</h3>
		<span
			class="flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1 text-xs font-bold tracking-wider text-brand-green uppercase"
		>
			<i class="fa-solid fa-circle-check text-[10px]"></i>
			{tx('step5.results.allDone')}
		</span>
	</div>

	<!-- Files grid: 2 columns desktop, 1 column mobile -->
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		{#each displayData as { file, result } (file.id)}
			<div
				class="overflow-hidden rounded-xl border border-brand-green/20 bg-navy-main/60"
			>
				<div class="flex items-center gap-3 px-4 py-3">
					<div
						class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border {getFileIconBorder(
							file
						)}"
					>
						<i class="fa-solid {getFileIcon(file)} text-sm {getFileIconColor(file)}"></i>
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-semibold text-white">{file.name}</p>
						<p class="text-[11px] text-text-muted">
							{formatSize(file.size)} · {getExtBadge(file)}{result?.gpsRemoved &&
							file.scanResult?.device
								? ` · ${file.scanResult.device}`
								: ''}
						</p>
					</div>
					<span
						class="rounded bg-navy-lighter px-2 py-0.5 text-[10px] font-bold text-text-muted uppercase"
						>{getExtBadge(file)}</span
					>
					<div
						class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
					>
						<i class="fa-solid fa-check text-[10px] text-brand-green"></i>
					</div>
				</div>
				<div class="flex flex-wrap gap-1.5 px-4 pb-3">
					{#if result?.gpsRemoved}
						<span
							class="rounded-full border border-brand-red/20 bg-brand-red/10 px-2 py-0.5 text-[10px] font-medium text-brand-red"
							>{tx('step5.results.gpsRemoved')}</span
						>
					{/if}
					{#if result && result.exifCount > 0}
						<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
							>EXIF ×{result.exifCount}</span
						>
					{/if}
					{#if result && result.xmpCount > 0}
						<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
							>XMP ×{result.xmpCount}</span
						>
					{/if}
					{#if result && result.id3Count > 0}
						<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
							>ID3 ×{result.id3Count}</span
						>
					{/if}
					{#if result && result.mp4AtomsCount > 0}
						<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
							>MP4 atoms ×{result.mp4AtomsCount}</span
						>
					{/if}
					{#if result && result.pngChunksCount > 0}
						<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
							>PNG chunks ×{result.pngChunksCount}</span
						>
					{/if}
					{#if result && result.totalFields > 0}
						<span
							class="rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[10px] font-medium text-brand-green"
							>{tx('step5.results.fieldsCount', { count: result.totalFields })}</span
						>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Action buttons (hidden on mobile — MobileBottomCta provides these actions) -->
	<div class="mt-1 hidden gap-3 lg:flex">
		<button
			onclick={onDownload}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-400"
		>
			<i class="fa-solid fa-download"></i>
			{(files?.length ?? 0) === 1 ? tx('common.download') : tx('common.downloadZip')}
		</button>
		<button
			onclick={onViewReport}
			class="flex items-center gap-2 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-5 py-3.5 text-sm font-semibold text-brand-blue transition-all hover:bg-brand-blue/20"
		>
			<i class="fa-solid fa-file-lines"></i>
			{tx('common.viewReport')}
		</button>
	</div>
</div>

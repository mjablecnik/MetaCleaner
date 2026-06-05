<script lang="ts">
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import type { FileMetadataResult } from '$lib/repositories/processingRepository';
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		file: UploadedFile;
		result: FileMetadataResult;
	}

	const { file, result }: Props = $props();

	const iconStyle = $derived(
		file.type === 'video'
			? { bg: 'bg-brand-orange/10', text: 'text-brand-orange', border: 'border-brand-orange/20' }
			: file.extension === 'PNG'
				? { bg: 'bg-brand-blue/10', text: 'text-brand-blue', border: 'border-brand-blue/20' }
				: { bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/20' }
	);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		locale.current;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="file-result-item rounded-xl border border-brand-green/20 bg-navy-main/60 overflow-hidden">
	<div class="flex items-center gap-3 px-3 lg:px-4 py-3">
		<div
			class="w-9 h-9 rounded-lg {iconStyle.bg} {iconStyle.border} border flex items-center justify-center flex-shrink-0"
		>
			<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {iconStyle.text} text-sm"
			></i>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-semibold text-white truncate">{file.name}</p>
			<p class="text-[11px] text-text-muted">
				{file.size} · {file.extension}{file.device ? ` · ${file.device}` : ''}
			</p>
		</div>
		<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
			>{file.extension}</span
		>
		<div
			class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center flex-shrink-0"
		>
			<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
		</div>
	</div>
	<div class="px-3 lg:px-4 pb-3 flex flex-wrap gap-1.5">
		{#if result.gpsRemoved}
			<span
				class="text-[10px] px-2 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-medium"
			>
				{tx('step5.results.gpsRemoved')}
			</span>
		{/if}
		{#if result.exifCount > 0}
			<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
				>EXIF ×{result.exifCount}</span
			>
		{/if}
		{#if result.xmpCount > 0}
			<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
				>XMP ×{result.xmpCount}</span
			>
		{/if}
		{#if result.id3Count > 0}
			<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
				>ID3 ×{result.id3Count}</span
			>
		{/if}
		{#if result.mp4AtomsCount > 0}
			<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
				>MP4 atoms ×{result.mp4AtomsCount}</span
			>
		{/if}
		{#if result.pngChunksCount > 0}
			<span class="text-[10px] px-2 py-0.5 rounded-full bg-navy-lighter text-text-muted"
				>PNG chunks ×{result.pngChunksCount}</span
			>
		{/if}
		<span
			class="text-[10px] px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-medium"
		>
			{tx('step5.metadata.fieldsCount', { count: result.totalFields })}
		</span>
	</div>
</div>

<style>
	.file-result-item {
		transition: background 0.15s;
	}
	.file-result-item:hover {
		background: var(--color-navy-lighter);
	}
</style>

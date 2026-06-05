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
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div
	class="file-result-item overflow-hidden rounded-xl border border-brand-green/20 bg-navy-main/60"
>
	<div class="flex items-center gap-3 px-3 py-3 lg:px-4">
		<div
			class="h-9 w-9 rounded-lg {iconStyle.bg} {iconStyle.border} flex flex-shrink-0 items-center justify-center border"
		>
			<i class="fa-solid {file.type === 'video' ? 'fa-video' : 'fa-image'} {iconStyle.text} text-sm"
			></i>
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-semibold text-white">{file.name}</p>
			<p class="text-[11px] text-text-muted">
				{file.size} · {file.extension}{file.device ? ` · ${file.device}` : ''}
			</p>
		</div>
		<span
			class="rounded bg-navy-lighter px-2 py-0.5 text-[10px] font-bold text-text-muted uppercase"
			>{file.extension}</span
		>
		<div
			class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
		>
			<i class="fa-solid fa-check text-[10px] text-brand-green"></i>
		</div>
	</div>
	<div class="flex flex-wrap gap-1.5 px-3 pb-3 lg:px-4">
		{#if result.gpsRemoved}
			<span
				class="rounded-full border border-brand-red/20 bg-brand-red/10 px-2 py-0.5 text-[10px] font-medium text-brand-red"
			>
				{tx('step5.results.gpsRemoved')}
			</span>
		{/if}
		{#if result.exifCount > 0}
			<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
				>EXIF ×{result.exifCount}</span
			>
		{/if}
		{#if result.xmpCount > 0}
			<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
				>XMP ×{result.xmpCount}</span
			>
		{/if}
		{#if result.id3Count > 0}
			<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
				>ID3 ×{result.id3Count}</span
			>
		{/if}
		{#if result.mp4AtomsCount > 0}
			<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
				>MP4 atoms ×{result.mp4AtomsCount}</span
			>
		{/if}
		{#if result.pngChunksCount > 0}
			<span class="rounded-full bg-navy-lighter px-2 py-0.5 text-[10px] text-text-muted"
				>PNG chunks ×{result.pngChunksCount}</span
			>
		{/if}
		<span
			class="rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 text-[10px] font-medium text-brand-green"
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

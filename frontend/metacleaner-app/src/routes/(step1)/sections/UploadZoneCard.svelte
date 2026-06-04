<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import Card from '$lib/shared/elements/Card.svelte';
	import FileListItem from '$lib/shared/components/FileListItem.svelte';
	import DropZone from '../components/DropZone.svelte';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	interface Props {
		files: File[];
		onFiles: (files: FileList) => void;
		onRemoveFile: (index: number) => void;
		onClearFiles: () => void;
		onOpenOptions: () => void;
	}

	let { files, onFiles, onRemoveFile, onClearFiles, onOpenOptions }: Props = $props();

	const FILE_FORMATS = ['JPG', 'PNG', 'HEIC', 'MP4', 'MOV'];

	const hasFiles = $derived(files.length > 0);

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	function toUploadedFile(file: File, index: number): UploadedFile {
		const ext = file.name.split('.').pop()?.toUpperCase() ?? '';
		return {
			id: `upload-${index}`,
			name: file.name,
			size: formatSize(file.size),
			extension: ext,
			type: file.type.startsWith('video/') ? 'video' : 'image',
			metadataFieldCount: 0,
			hasGps: false,
		};
	}

	const uploadedFiles = $derived(files.map(toUploadedFile));
</script>

<Card class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.upload.title')}</h3>
		<div class="flex gap-1 lg:gap-1.5 flex-wrap justify-end">
			{#each FILE_FORMATS as ext}
				<span class="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded bg-navy-lighter text-[9px] lg:text-[10px] font-bold text-white uppercase">
					{ext}
				</span>
			{/each}
		</div>
	</div>

	<DropZone {onFiles} />

	{#if hasFiles}
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between mb-1">
				<span class="text-sm font-semibold text-white">{tx('step1.files.title')}</span>
				<button
					onclick={onClearFiles}
					class="text-xs text-text-muted hover:text-brand-red transition-colors flex items-center gap-1 min-h-[44px] lg:min-h-0 px-2 lg:px-0"
				>
					<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>{tx('step1.files.clearAll')}
				</button>
			</div>
			<div class="flex flex-col gap-2 max-h-[180px] lg:max-h-[220px] overflow-y-auto pr-1">
				{#each uploadedFiles as file, i}
					<FileListItem {file} onRemove={() => onRemoveFile(i)} />
				{/each}
			</div>
		</div>
	{/if}

	<div class="flex flex-col lg:flex-row gap-2.5 lg:gap-3 mt-1">
		<button
			disabled={!hasFiles}
			onclick={() => hasFiles && goto('/step2')}
			class="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
				{hasFiles
					? 'bg-brand-green text-white hover:bg-green-500 shadow-glow-green cursor-pointer'
					: 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'}"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			{tx('step1.actions.startCleaning')}
		</button>
		<button
			onclick={onOpenOptions}
			class="lg:px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
		>
			<i class="fa-solid fa-sliders"></i>
			{tx('step1.actions.options')}
		</button>
	</div>
</Card>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { locale } from '$lib/locale.svelte';
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
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
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
			hasGps: false
		};
	}

	const uploadedFiles = $derived(files.map(toUploadedFile));
</script>

<Card class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.upload.title')}</h3>
		<div class="flex flex-wrap justify-end gap-1 lg:gap-1.5">
			{#each FILE_FORMATS as ext (ext)}
				<span
					class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-white uppercase lg:px-2 lg:py-1 lg:text-[10px]"
				>
					{ext}
				</span>
			{/each}
		</div>
	</div>

	<DropZone {onFiles} />

	{#if hasFiles}
		<div class="flex flex-col gap-2">
			<div class="mb-1 flex items-center justify-between">
				<span class="text-sm font-semibold text-white">{tx('step1.files.title')}</span>
				<button
					onclick={onClearFiles}
					class="flex min-h-[44px] items-center gap-1 px-2 text-xs text-text-muted transition-colors hover:text-brand-red lg:min-h-0 lg:px-0"
				>
					<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>{tx('step1.files.clearAll')}
				</button>
			</div>
			<div class="flex max-h-[180px] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[220px]">
				{#each uploadedFiles as file, i (file.id)}
					<FileListItem {file} onRemove={() => onRemoveFile(i)} />
				{/each}
			</div>
		</div>
	{/if}

	<div class="mt-1 flex flex-col gap-2.5 lg:flex-row lg:gap-3">
		<button
			disabled={!hasFiles}
			onclick={() => hasFiles && goto(resolve('/step2'))}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all
				{hasFiles
				? 'cursor-pointer bg-brand-green text-white shadow-glow-green hover:bg-green-500'
				: 'cursor-not-allowed bg-gray-700 text-gray-500 opacity-60'}"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			{tx('step1.actions.startCleaning')}
		</button>
		<button
			onclick={onOpenOptions}
			class="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 lg:px-5"
		>
			<i class="fa-solid fa-sliders"></i>
			{tx('step1.actions.options')}
		</button>
	</div>
</Card>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		onFiles: (files: FileList) => void;
		/** Compact "add more" mode — shows plus icon with short label instead of full upload prompt. */
		compact?: boolean;
	}

	let { onFiles, compact = false }: Props = $props();

	let isDragOver = $state(false);
	let fileInputId = 'dropzone-file-input';

	function tx(key: string): string {
		void locale.current;
		const fn = (m as unknown as Record<string, (() => string) | undefined>)[key];
		return fn ? fn() : key;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		if (e.dataTransfer?.files?.length) {
			onFiles(e.dataTransfer.files);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.length) {
			onFiles(input.files);
		}
		input.value = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			document.getElementById(fileInputId)?.click();
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	class="dashed-border-anim relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl transition-colors
		{compact ? 'py-6' : 'py-8 lg:gap-4 lg:py-12'}
		{isDragOver ? 'bg-navy-lighter' : 'bg-navy-main/50 hover:bg-navy-main/80'}"
	onclick={() => document.getElementById(fileInputId)?.click()}
	onkeydown={handleKeydown}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
>
	{#if compact}
		<div
			class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-lighter text-lg text-brand-blue shadow-glow-blue"
		>
			<i class="fa-solid fa-plus"></i>
		</div>
		<p class="text-xs text-text-muted">{tx('step2.files.addMore')}</p>
	{:else}
		<div
			class="flex h-14 w-14 items-center justify-center rounded-full bg-navy-lighter text-xl text-brand-blue shadow-glow-blue lg:h-16 lg:w-16 lg:text-2xl"
		>
			<i class="fa-solid fa-file-arrow-up"></i>
		</div>
		<div class="text-center">
			<p class="mb-1 hidden font-semibold text-white lg:block">
				{tx('step1.upload.dropDesktop')}
			</p>
			<p class="mb-0.5 block text-sm font-semibold text-white lg:hidden">
				{tx('step1.upload.dropMobile')}
			</p>
			<p class="hidden text-xs text-text-muted lg:block">
				{tx('step1.upload.orClickDesktop')}
			</p>
			<p class="block text-xs text-text-muted lg:hidden">{tx('step1.upload.orDragMobile')}</p>
		</div>
		<div class="mt-0 flex flex-wrap justify-center gap-1.5 lg:mt-1 lg:gap-2">
			<span
				class="rounded-full bg-navy-lighter px-2.5 py-1 text-[10px] text-text-muted lg:px-3 lg:text-[11px]"
			>
				{tx('step1.upload.photos')}
			</span>
			<span
				class="rounded-full bg-navy-lighter px-2.5 py-1 text-[10px] text-text-muted lg:px-3 lg:text-[11px]"
			>
				{tx('step1.upload.videos')}
			</span>
			<span
				class="rounded-full bg-navy-lighter px-2.5 py-1 text-[10px] text-text-muted lg:px-3 lg:text-[11px]"
			>
				<span class="hidden lg:inline">{tx('step1.upload.maxSize')}</span>
				<span class="inline lg:hidden">{tx('step1.upload.maxSizeMobile')}</span>
			</span>
		</div>
	{/if}
	<input
		type="file"
		id={fileInputId}
		multiple
		accept=".jpg,.jpeg,.png,.heic,.heif,.mp4,.mov"
		onchange={handleFileInput}
		class="hidden"
	/>
</div>

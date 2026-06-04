<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		onFiles: (files: FileList) => void;
	}

	let { onFiles }: Props = $props();

	let isDragOver = $state(false);
	let fileInputId = 'dropzone-file-input';

	function tx(key: string): string {
		currentLocale;
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
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="dashed-border-anim rounded-xl flex flex-col items-center justify-center gap-3 lg:gap-4 cursor-pointer transition-colors py-8 lg:py-12 relative
		{isDragOver ? 'bg-navy-lighter' : 'bg-navy-main/50 hover:bg-navy-main/80'}"
	onclick={() => document.getElementById(fileInputId)?.click()}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
>
	<div
		class="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue text-xl lg:text-2xl shadow-glow-blue"
	>
		<i class="fa-solid fa-file-arrow-up"></i>
	</div>
	<div class="text-center">
		<p class="hidden lg:block font-semibold text-white mb-1">
			{tx('step1.upload.dropDesktop')}
		</p>
		<p class="block lg:hidden font-semibold text-white text-sm mb-0.5">
			{tx('step1.upload.dropMobile')}
		</p>
		<p class="hidden lg:block text-xs text-text-muted">
			{tx('step1.upload.orClickDesktop')}
		</p>
		<p class="block lg:hidden text-xs text-text-muted">{tx('step1.upload.orDragMobile')}</p>
	</div>
	<div class="flex flex-wrap gap-1.5 lg:gap-2 justify-center mt-0 lg:mt-1">
		<span class="text-[10px] lg:text-[11px] text-text-muted bg-navy-lighter px-2.5 lg:px-3 py-1 rounded-full">
			{tx('step1.upload.photos')}
		</span>
		<span class="text-[10px] lg:text-[11px] text-text-muted bg-navy-lighter px-2.5 lg:px-3 py-1 rounded-full">
			{tx('step1.upload.videos')}
		</span>
		<span class="text-[10px] lg:text-[11px] text-text-muted bg-navy-lighter px-2.5 lg:px-3 py-1 rounded-full">
			<span class="hidden lg:inline">{tx('step1.upload.maxSize')}</span>
			<span class="inline lg:hidden">{tx('step1.upload.maxSizeMobile')}</span>
		</span>
	</div>
	<input
		type="file"
		id={fileInputId}
		multiple
		accept="image/*,video/*"
		onchange={handleFileInput}
		class="hidden"
	/>
</div>

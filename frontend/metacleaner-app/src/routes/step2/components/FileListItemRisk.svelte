<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	interface Props {
		file: UploadedFile;
		onRemove?: () => void;
	}

	const { file, onRemove }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const isVideo = $derived(file.type === 'video');

	const rowBorderClass = $derived(file.hasGps ? 'border-red-900/30' : 'border-gray-800');

	const iconContainerClass = $derived(
		file.hasGps
			? 'border-brand-red/20 bg-brand-red/10'
			: isVideo
				? 'border-brand-orange/20 bg-brand-orange/10'
				: 'border-brand-blue/20 bg-brand-blue/10'
	);

	const iconClass = $derived(
		file.hasGps ? 'text-brand-red' : isVideo ? 'text-brand-orange' : 'text-brand-blue'
	);

	const fileIcon = $derived(isVideo ? 'fa-video' : 'fa-image');
</script>

<div
	class="group flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-default bg-navy-main/60 {rowBorderClass}"
>
	<div
		class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border {iconContainerClass}"
	>
		<i class="fa-solid {fileIcon} {iconClass} text-sm"></i>
	</div>
	<div class="flex-1 min-w-0">
		<p class="text-sm font-medium text-white truncate">{file.name}</p>
		<div class="flex items-center gap-2 mt-0.5">
			<span class="text-[11px] text-text-muted">{file.size}</span>
			<span class="w-1 h-1 rounded-full bg-gray-600"></span>
			{#if file.hasGps}
				<span class="text-[11px] text-brand-red font-medium flex items-center gap-1">
					<i class="fa-solid fa-location-dot text-[9px]"></i>{tx('step2.files.gpsFound')}
				</span>
			{:else if file.metadataFieldCount > 5}
				<span class="text-[11px] text-brand-orange font-medium flex items-center gap-1">
					<i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
					<span class="hidden lg:inline">{tx('step2.files.metadataFields', { count: file.metadataFieldCount })}</span>
					<span class="inline lg:hidden">{tx('step2.files.metadataFieldsMobile', { count: file.metadataFieldCount })}</span>
				</span>
			{:else}
				<span class="text-[11px] text-text-muted flex items-center gap-1">
					<i class="fa-solid fa-circle-check text-brand-green text-[9px]"></i>
					<span class="hidden lg:inline">{tx('step2.files.metadataFields', { count: file.metadataFieldCount })}</span>
					<span class="inline lg:hidden">{tx('step2.files.metadataFieldsMobile', { count: file.metadataFieldCount })}</span>
				</span>
			{/if}
		</div>
	</div>
	<div class="flex items-center gap-2">
		<span
			class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
		>{file.extension}</span>
		<button
			onclick={onRemove}
			aria-label="Remove file"
			class="text-gray-600 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
		>
			<i class="fa-solid fa-xmark text-sm"></i>
		</button>
	</div>
</div>

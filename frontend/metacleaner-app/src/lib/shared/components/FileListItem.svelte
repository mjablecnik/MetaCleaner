<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { UploadedFile } from '$lib/repositories/fileRepository';

	type Status = 'default' | 'success' | 'error' | 'muted';

	interface Props {
		file: UploadedFile;
		status?: Status;
		onRemove?: () => void;
		statusInfo?: Snippet;
		rightActions?: Snippet;
	}

	let { file, status = 'default', onRemove, statusInfo, rightActions }: Props = $props();

	const isVideo = $derived(file.type === 'video');

	const rowBorderClass = $derived(
		status === 'success'
			? 'border-brand-green/20'
			: status === 'error'
				? 'border-brand-red/30'
				: 'border-gray-800'
	);

	const rowBgClass = $derived(status === 'error' ? 'bg-brand-red/5' : 'bg-navy-main/60');

	const iconColorClass = $derived(
		status === 'success'
			? 'text-brand-green'
			: status === 'error'
				? 'text-brand-red'
				: isVideo
					? 'text-brand-orange'
					: 'text-brand-blue'
	);

	const iconBgClass = $derived(
		status === 'success'
			? 'bg-brand-green/10'
			: status === 'error'
				? 'bg-brand-red/10'
				: isVideo
					? 'bg-brand-orange/10'
					: 'bg-brand-blue/10'
	);

	const iconBorderClass = $derived(
		status === 'success'
			? 'border-brand-green/20'
			: status === 'error'
				? 'border-brand-red/20'
				: isVideo
					? 'border-brand-orange/20'
					: 'border-brand-blue/20'
	);

	const fileIcon = $derived(isVideo ? 'fa-video' : 'fa-image');
</script>

<div
	class="group flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-default {rowBorderClass} {rowBgClass}"
	class:opacity-50={status === 'muted'}
>
	<div
		class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border {iconBgClass} {iconBorderClass}"
	>
		<i class="fa-solid {fileIcon} {iconColorClass} text-sm"></i>
	</div>
	<div class="flex-1 min-w-0">
		<p class="text-sm font-medium text-white truncate">{file.name}</p>
		<div class="flex items-center gap-2 mt-0.5">
			<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
			{#if statusInfo}
				<span class="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0"></span>
				{@render statusInfo()}
			{/if}
		</div>
	</div>
	<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
		<span
			class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
		>
			{file.extension}
		</span>
		{#if rightActions}
			{@render rightActions()}
		{:else if onRemove}
			<button
				onclick={onRemove}
				aria-label="Remove file"
				class="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-navy-lighter text-text-muted hover:text-white hover:bg-gray-700 transition-all"
			>
				<i class="fa-solid fa-xmark text-xs"></i>
			</button>
		{/if}
	</div>
</div>

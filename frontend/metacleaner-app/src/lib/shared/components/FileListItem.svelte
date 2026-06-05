<script lang="ts">
	import type { Snippet } from 'svelte';

	interface FileItem {
		name: string;
		size: string | number;
		extension: string;
		type: 'image' | 'video';
	}

	type Status = 'default' | 'success' | 'error' | 'muted';

	interface Props {
		file: FileItem;
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
	class="group flex cursor-default items-center gap-3 rounded-xl border px-3 py-2.5 {rowBorderClass} {rowBgClass}"
	class:opacity-50={status === 'muted'}
>
	<div
		class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border {iconBgClass} {iconBorderClass}"
	>
		<i class="fa-solid {fileIcon} {iconColorClass} text-sm"></i>
	</div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium text-white">{file.name}</p>
		<div class="mt-0.5 flex items-center gap-2">
			<span class="text-[10px] text-text-muted lg:text-[11px]">{file.size}</span>
			{#if statusInfo}
				<span class="h-1 w-1 flex-shrink-0 rounded-full bg-gray-600"></span>
				{@render statusInfo()}
			{/if}
		</div>
	</div>
	<div class="flex flex-shrink-0 items-center gap-1.5 lg:gap-2">
		<span
			class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
		>
			{file.extension}
		</span>
		{#if rightActions}
			{@render rightActions()}
		{:else if onRemove}
			<button
				onclick={onRemove}
				aria-label="Remove file"
				class="flex h-6 w-6 items-center justify-center rounded-full bg-navy-lighter text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-700 hover:text-white"
			>
				<i class="fa-solid fa-xmark text-xs"></i>
			</button>
		{/if}
	</div>
</div>

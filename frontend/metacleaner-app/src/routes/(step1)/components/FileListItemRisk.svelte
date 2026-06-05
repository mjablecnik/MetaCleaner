<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { QueuedFile } from '$lib/scanner/types';
	import ScanProgressIndicator from './ScanProgressIndicator.svelte';

	interface Props {
		file: QueuedFile;
		onRemove?: () => void;
	}

	const { file, onRemove }: Props = $props();

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

	const status = $derived(file.scanResult?.status ?? 'pending');
	const hasGps = $derived(file.scanResult?.hasGps ?? false);
	const fieldCount = $derived(file.scanResult?.fieldCount ?? 0);
	const device = $derived(file.scanResult?.device);
	const isVideo = $derived(file.type === 'video');
	const sizeLabel = $derived(formatSize(file.size));
	const ext = $derived(file.extension.replace('.', '').toUpperCase() || 'FILE');

	const rowBorderClass = $derived(hasGps ? 'border-red-900/30' : 'border-gray-800');
	const iconContainerClass = $derived(
		hasGps
			? 'border-brand-red/20 bg-brand-red/10'
			: isVideo
				? 'border-brand-orange/20 bg-brand-orange/10'
				: 'border-brand-blue/20 bg-brand-blue/10'
	);
	const iconClass = $derived(
		hasGps ? 'text-brand-red' : isVideo ? 'text-brand-orange' : 'text-brand-blue'
	);
	const fileIcon = $derived(isVideo ? 'fa-video' : 'fa-image');
</script>

<div
	class="group flex cursor-default items-center gap-3 rounded-xl border bg-navy-main/60 px-3 py-2.5 {rowBorderClass}"
>
	<div
		class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border {iconContainerClass}"
	>
		<i class="fa-solid {fileIcon} {iconClass} text-sm"></i>
	</div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium text-white">{file.name}</p>
		<div class="mt-0.5 flex items-center gap-2">
			<span class="text-[11px] text-text-muted">{sizeLabel}</span>
			{#if status === 'pending' || status === 'scanning'}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<ScanProgressIndicator {status} />
			{:else if status === 'error'}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="text-[11px] text-brand-orange">{tx('step2.files.scanError')}</span>
			{:else if hasGps}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[11px] font-medium text-brand-red">
					<i class="fa-solid fa-location-dot text-[9px]"></i>{tx('step2.files.gpsFound')}
				</span>
			{:else if fieldCount > 5}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[11px] font-medium text-brand-orange">
					<i class="fa-solid fa-triangle-exclamation text-[9px]"></i>
					<span class="hidden lg:inline"
						>{tx('step2.files.metadataFields', { count: fieldCount })}</span
					>
					<span class="inline lg:hidden"
						>{tx('step2.files.metadataFieldsMobile', { count: fieldCount })}</span
					>
				</span>
			{:else}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[11px] text-text-muted">
					<i class="fa-solid fa-circle-check text-[9px] text-brand-green"></i>
					<span class="hidden lg:inline"
						>{tx('step2.files.metadataFields', { count: fieldCount })}</span
					>
					<span class="inline lg:hidden"
						>{tx('step2.files.metadataFieldsMobile', { count: fieldCount })}</span
					>
				</span>
			{/if}
		</div>
		{#if device && status === 'done'}
			<p class="mt-0.5 truncate text-[10px] text-text-muted">{device}</p>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<span
			class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
			>{ext}</span
		>
		<button
			onclick={onRemove}
			aria-label="Remove file"
			class="text-gray-600 opacity-0 transition-colors group-hover:opacity-100 hover:text-brand-red"
		>
			<i class="fa-solid fa-xmark text-sm"></i>
		</button>
	</div>
</div>

<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { formatSize } from '$lib/shared/utils/format';
	import type { QueuedFile } from '$lib/scanner/types';
	import ScanProgressIndicator from './ScanProgressIndicator.svelte';
	import CostBadge from '$lib/shared/elements/CostBadge.svelte';

	interface Props {
		file: QueuedFile;
		onRemove?: () => void;
	}

	const { file, onRemove }: Props = $props();

	const status = $derived(file?.scanResult?.status ?? 'pending');
	const isUnknown = $derived(file?.type === 'unknown');
	const hasGps = $derived(file?.scanResult?.hasGps ?? false);
	const fieldCount = $derived(file?.scanResult?.fieldCount ?? 0);
	const device = $derived(file?.scanResult?.device);
	const isAIGenerated = $derived(file?.scanResult?.aiDetection?.isAIGenerated ?? false);
	const isVideo = $derived(file?.type === 'video');
	const sizeLabel = $derived(formatSize(file?.size));
	const ext = $derived(file?.extension?.replace('.', '').toUpperCase() || 'FILE');

	// Row border class based on state
	const rowBorderClass = $derived((): string => {
		if (isUnknown) return 'border-gray-800 opacity-50';
		if (status === 'error') return 'border-brand-red/40';
		if (status === 'scanning') return 'border-brand-blue/40';
		if (status === 'pending') return 'border-gray-800 opacity-50';
		if (status === 'done' && hasGps) return 'border-red-900/30';
		return 'border-gray-800';
	});

	// Icon container class based on state
	const iconContainerClass = $derived((): string => {
		if (isUnknown || status === 'pending') return 'border-gray-700 bg-gray-800/50';
		if (status === 'error') return 'border-brand-red/20 bg-brand-red/10';
		if (status === 'scanning') return 'border-brand-blue/20 bg-brand-blue/10';
		if (status === 'done' && hasGps) return 'border-brand-red/20 bg-brand-red/10';
		if (status === 'done' && isVideo) return 'border-brand-orange/20 bg-brand-orange/10';
		return 'border-brand-blue/20 bg-brand-blue/10';
	});

	const iconClass = $derived((): string => {
		if (isUnknown || status === 'pending') return 'text-gray-500';
		if (status === 'error') return 'text-brand-red';
		if (status === 'scanning') return 'text-brand-blue';
		if (status === 'done' && hasGps) return 'text-brand-red';
		if (status === 'done' && isVideo) return 'text-brand-orange';
		return 'text-brand-blue';
	});

	const fileIcon = $derived(isVideo ? 'fa-video' : 'fa-image');
</script>

<div
	class="group flex cursor-default items-center gap-3 rounded-xl border bg-navy-main/60 px-3 py-2.5 {rowBorderClass()}"
>
	<div
		class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border {iconContainerClass()}"
	>
		{#if status === 'error'}
			<i class="fa-solid fa-circle-xmark {iconClass()} text-sm"></i>
		{:else if isUnknown}
			<i class="fa-solid fa-ban {iconClass()} text-sm"></i>
		{:else}
			<i class="fa-solid {fileIcon} {iconClass()} text-sm"></i>
		{/if}
	</div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium text-white">{file?.name}</p>
		<div class="mt-0.5 flex items-center gap-2">
			<span class="text-[11px] text-text-muted">{sizeLabel}</span>
			{#if isUnknown}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[11px] text-text-muted">
					<i class="fa-solid fa-ban text-[9px]"></i>
					{tx('step4.error.skipped')}
				</span>
			{:else if status === 'pending'}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[11px] text-text-muted">
					<i class="fa-solid fa-clock text-[9px]"></i>
					{tx('step3.files.waitingInQueue')}
				</span>
			{:else if status === 'scanning'}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<ScanProgressIndicator {status} />
			{:else if status === 'error'}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="text-[11px] text-brand-orange">{tx('step2.files.scanError')}</span>
			{:else if isAIGenerated}
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[11px] font-medium text-brand-red">
					<i class="fa-solid fa-robot text-[9px]"></i>{tx('step2.files.aiGenerated')}
				</span>
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
		{#if !isUnknown}
			<CostBadge cost={1} />
		{/if}
		<span
			class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
			>{ext}</span
		>
		<button
			onclick={onRemove}
			aria-label={tx('common.removeFile')}
			class="text-gray-600 opacity-100 transition-colors hover:text-brand-red lg:opacity-0 lg:group-hover:opacity-100"
		>
			<i class="fa-solid fa-xmark text-sm"></i>
		</button>
	</div>
</div>

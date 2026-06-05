<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { QueuedFile } from '$lib/scanner/types';
	import type { FileProcessingStatus } from '$lib/types/processing';

	interface Props {
		file: QueuedFile;
		status: FileProcessingStatus;
		progress?: number;
		fieldsRemoved?: number;
		gpsRemoved?: boolean;
	}

	const { file, status, progress = 0, fieldsRemoved = 0, gpsRemoved = false }: Props = $props();

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

	const isVideo = $derived(file.type === 'video');
	const fileIcon = $derived(isVideo ? 'fa-video' : 'fa-image');
	const sizeLabel = $derived(formatSize(file.size));
	const ext = $derived(file.extension.replace('.', '').toUpperCase() || 'FILE');
</script>

{#if status === 'done'}
	<div
		class="flex cursor-default items-center gap-3 rounded-xl border border-brand-green/20 bg-navy-main/60 px-3 py-2.5"
	>
		<div
			class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10"
		>
			<i class="fa-solid {fileIcon} text-sm text-brand-green"></i>
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium text-white">{file.name}</p>
			<div class="mt-0.5 flex items-center gap-2">
				<span class="text-[10px] text-text-muted lg:text-[11px]">{sizeLabel}</span>
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span
					class="flex items-center gap-1 text-[10px] font-medium text-brand-green lg:text-[11px]"
				>
					<i class="fa-solid fa-circle-check text-[9px]"></i>
					{#if gpsRemoved}
						<span class="hidden lg:inline"
							>{tx('step3.files.gpsAndFieldsRemoved', { count: fieldsRemoved })}</span
						>
						<span class="inline lg:hidden"
							>{tx('step3.files.gpsAndFieldsRemovedMobile', { count: fieldsRemoved })}</span
						>
					{:else}
						{fieldsRemoved} {tx('step3.files.fieldsRemoved')}
					{/if}
				</span>
			</div>
		</div>
		<div class="flex flex-shrink-0 items-center gap-1.5 lg:gap-2">
			<span
				class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
				>{ext}</span
			>
			<div
				class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
			>
				<i class="fa-solid fa-check text-[10px] text-brand-green"></i>
			</div>
		</div>
	</div>
{:else if status === 'in_progress'}
	<div
		class="flex cursor-default items-center gap-3 rounded-xl border border-brand-blue/30 bg-brand-blue/5 px-3 py-2.5"
	>
		<div
			class="h-9 w-9 rounded-lg {isVideo
				? 'border border-brand-orange/20 bg-brand-orange/10'
				: 'border border-brand-blue/20 bg-brand-blue/10'} flex flex-shrink-0 items-center justify-center"
		>
			<i class="fa-solid {fileIcon} {isVideo ? 'text-brand-orange' : 'text-brand-blue'} text-sm"
			></i>
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium text-white">{file.name}</p>
			<div class="mt-1 flex flex-col gap-1">
				<div class="flex items-center justify-between">
					<span
						class="flex items-center gap-1 text-[10px] font-medium text-brand-blue lg:text-[11px]"
					>
						<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
						{tx('step3.files.processing')}
					</span>
					<span class="text-[10px] font-bold text-brand-blue lg:text-[11px]">{progress}%</span>
				</div>
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-navy-lighter">
					<div
						class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
						style="width:{progress}%"
					></div>
				</div>
			</div>
		</div>
		<div class="flex flex-shrink-0 items-center gap-1.5 lg:gap-2">
			<span
				class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
				>{ext}</span
			>
			<i class="fa-solid fa-circle-notch spin-slow text-sm text-brand-blue"></i>
		</div>
	</div>
{:else}
	<div
		class="flex cursor-default items-center gap-3 rounded-xl border border-gray-800 bg-navy-main/60 px-3 py-2.5 opacity-50"
	>
		<div
			class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-blue/20 bg-brand-blue/10"
		>
			<i class="fa-solid {fileIcon} text-sm text-brand-blue"></i>
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium text-white">{file.name}</p>
			<div class="mt-0.5 flex items-center gap-2">
				<span class="text-[10px] text-text-muted lg:text-[11px]">{sizeLabel}</span>
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[10px] text-text-muted lg:text-[11px]">
					<i class="fa-solid fa-clock text-[9px]"></i>
					{tx('step3.files.waitingInQueue')}
				</span>
			</div>
		</div>
		<span
			class="flex-shrink-0 rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
			>{ext}</span
		>
	</div>
{/if}

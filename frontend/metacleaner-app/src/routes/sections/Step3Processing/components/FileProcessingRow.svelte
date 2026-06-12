<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import { formatSize } from '$lib/shared/utils/format';
	import type { QueuedFile } from '$lib/scanner/types';

	export interface FileRowState {
		status: 'waiting' | 'in_progress' | 'done' | 'error';
		progress: number;
		fieldsRemoved: number;
		gpsRemoved: boolean;
	}

	interface Props {
		file: QueuedFile;
		state: FileRowState;
		class?: string;
	}

	const { file, state, class: className = '' }: Props = $props();

	function rowBorderClass(status: string): string {
		if (status === 'done') return 'border-brand-green/20 bg-navy-main/60';
		if (status === 'in_progress') return 'border-brand-blue/30 bg-brand-blue/5';
		if (status === 'error') return 'border-brand-red/30 bg-navy-main/60';
		return 'border-gray-800 bg-navy-main/60 opacity-50';
	}

	function iconContainerClass(status: string, fileType: string): string {
		if (status === 'done') return 'border-brand-green/20 bg-brand-green/10';
		if (status === 'in_progress' && fileType === 'video')
			return 'border-brand-orange/20 bg-brand-orange/10';
		if (status === 'error') return 'border-brand-red/20 bg-brand-red/10';
		return 'border-brand-blue/20 bg-brand-blue/10';
	}

	function iconColorClass(status: string, fileType: string): string {
		if (status === 'done') return 'text-brand-green';
		if (status === 'in_progress' && fileType === 'video') return 'text-brand-orange';
		if (status === 'error') return 'text-brand-red';
		return 'text-brand-blue';
	}
</script>

<div
	class="flex cursor-default items-center gap-3 rounded-xl border px-3 py-2.5 lg:py-3 {rowBorderClass(
		state.status
	)} {className}"
>
	<!-- File icon -->
	<div
		class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border {iconContainerClass(
			state.status,
			file.type
		)}"
	>
		<i
			class="fa-solid {file.type === 'video'
				? 'fa-video'
				: 'fa-image'} text-sm {iconColorClass(state.status, file.type)}"
		></i>
	</div>

	<!-- File info -->
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium text-white">{file.name}</p>

		{#if state.status === 'done'}
			<div class="mt-0.5 flex flex-wrap items-center gap-1.5">
				<span class="text-[10px] text-text-muted lg:text-[11px]">{formatSize(file.size)}</span>
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[10px] font-medium text-brand-green lg:text-[11px]">
					<i class="fa-solid fa-circle-check text-[8px] lg:text-[9px]"></i>
					{#if state.gpsRemoved}
						{tx('step3.files.gpsAndFieldsRemovedMobile', { count: state.fieldsRemoved })}
					{:else}
						{state.fieldsRemoved}
						{tx('step3.files.fieldsRemoved')}
					{/if}
				</span>
			</div>
		{:else if state.status === 'in_progress'}
			<div class="mt-1 flex flex-col gap-1">
				<div class="flex items-center justify-between">
					<span class="flex items-center gap-1 text-[10px] font-medium text-brand-blue lg:text-[11px]">
						<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
						{tx('step3.files.processing')}
					</span>
					<span class="text-[10px] font-bold text-brand-blue lg:text-[11px]">{state.progress}%</span>
				</div>
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-navy-lighter">
					<div
						class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400 transition-all duration-200"
						style="width: {state.progress}%"
					></div>
				</div>
			</div>
		{:else if state.status === 'error'}
			<div class="mt-0.5 flex items-center gap-1.5">
				<span class="text-[10px] text-text-muted lg:text-[11px]">{formatSize(file.size)}</span>
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="text-[10px] text-brand-red lg:text-[11px]"
					>{tx('step4.error.processingFailed')}</span
				>
			</div>
		{:else}
			<!-- waiting -->
			<div class="mt-0.5 flex items-center gap-1.5">
				<span class="text-[10px] text-text-muted lg:text-[11px]">{formatSize(file.size)}</span>
				<span class="h-1 w-1 rounded-full bg-gray-600"></span>
				<span class="flex items-center gap-1 text-[10px] text-text-muted lg:text-[11px]">
					<i class="fa-solid fa-clock text-[8px] lg:text-[9px]"></i>
					{tx('step3.files.waitingInQueue')}
				</span>
			</div>
		{/if}
	</div>

	<!-- Right side indicator -->
	<div class="flex flex-shrink-0 items-center gap-1.5 lg:gap-2">
		<span
			class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase lg:px-2 lg:text-[10px]"
		>
			{file.extension.replace('.', '').toUpperCase() || 'FILE'}
		</span>
		{#if state.status === 'done'}
			<div
				class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10"
			>
				<i class="fa-solid fa-check text-[10px] text-brand-green"></i>
			</div>
		{:else if state.status === 'in_progress'}
			<i class="fa-solid fa-circle-notch spin-slow text-sm text-brand-blue"></i>
		{/if}
	</div>
</div>

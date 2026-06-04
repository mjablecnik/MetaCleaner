<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import type { FileProcessingStatus } from '$lib/repositories/processingRepository';

	interface Props {
		file: UploadedFile;
		status: FileProcessingStatus;
		progress?: number;
		fieldsRemoved?: number;
		gpsRemoved?: boolean;
	}

	const { file, status, progress = 0, fieldsRemoved = 0, gpsRemoved = false }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}

	const isVideo = $derived(file.type === 'video');
	const fileIcon = $derived(isVideo ? 'fa-video' : 'fa-image');
</script>

{#if status === 'done'}
	<div
		class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-green/20 cursor-default bg-navy-main/60"
	>
		<div
			class="w-9 h-9 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center flex-shrink-0"
		>
			<i class="fa-solid {fileIcon} text-brand-green text-sm"></i>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium text-white truncate">{file.name}</p>
			<div class="flex items-center gap-2 mt-0.5">
				<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
				<span class="w-1 h-1 rounded-full bg-gray-600"></span>
				<span class="text-[10px] lg:text-[11px] text-brand-green font-medium flex items-center gap-1">
					<i class="fa-solid fa-circle-check text-[9px]"></i>
					{#if gpsRemoved}
						<span class="hidden lg:inline">{tx('step3.files.gpsAndFieldsRemoved', { count: fieldsRemoved })}</span>
						<span class="inline lg:hidden">{tx('step3.files.gpsAndFieldsRemovedMobile', { count: fieldsRemoved })}</span>
					{:else}
						{fieldsRemoved} {tx('step3.files.fieldsRemoved')}
					{/if}
				</span>
			</div>
		</div>
		<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
			<span
				class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
			>{file.extension}</span>
			<div
				class="w-6 h-6 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center"
			>
				<i class="fa-solid fa-check text-brand-green text-[10px]"></i>
			</div>
		</div>
	</div>
{:else if status === 'in_progress'}
	<div
		class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-brand-blue/30 cursor-default bg-brand-blue/5"
	>
		<div
			class="w-9 h-9 rounded-lg {isVideo ? 'bg-brand-orange/10 border border-brand-orange/20' : 'bg-brand-blue/10 border border-brand-blue/20'} flex items-center justify-center flex-shrink-0"
		>
			<i class="fa-solid {fileIcon} {isVideo ? 'text-brand-orange' : 'text-brand-blue'} text-sm"></i>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium text-white truncate">{file.name}</p>
			<div class="flex flex-col gap-1 mt-1">
				<div class="flex items-center justify-between">
					<span class="text-[10px] lg:text-[11px] text-brand-blue font-medium flex items-center gap-1">
						<i class="fa-solid fa-circle-notch spin-slow text-[9px]"></i>
						{tx('step3.files.processing')}
					</span>
					<span class="text-[10px] lg:text-[11px] text-brand-blue font-bold">{progress}%</span>
				</div>
				<div class="w-full h-1.5 bg-navy-lighter rounded-full overflow-hidden">
					<div
						class="h-full rounded-full bg-gradient-to-r from-brand-blue to-blue-400"
						style="width:{progress}%"
					></div>
				</div>
			</div>
		</div>
		<div class="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
			<span
				class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted"
			>{file.extension}</span>
			<i class="fa-solid fa-circle-notch spin-slow text-brand-blue text-sm"></i>
		</div>
	</div>
{:else}
	<div
		class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-800 cursor-default opacity-50 bg-navy-main/60"
	>
		<div
			class="w-9 h-9 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0"
		>
			<i class="fa-solid {fileIcon} text-brand-blue text-sm"></i>
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium text-white truncate">{file.name}</p>
			<div class="flex items-center gap-2 mt-0.5">
				<span class="text-[10px] lg:text-[11px] text-text-muted">{file.size}</span>
				<span class="w-1 h-1 rounded-full bg-gray-600"></span>
				<span class="text-[10px] lg:text-[11px] text-text-muted flex items-center gap-1">
					<i class="fa-solid fa-clock text-[9px]"></i> {tx('step3.files.waitingInQueue')}
				</span>
			</div>
		</div>
		<span
			class="text-[9px] lg:text-[10px] font-bold uppercase px-1.5 lg:px-2 py-0.5 rounded bg-navy-lighter text-text-muted flex-shrink-0"
		>{file.extension}</span>
	</div>
{/if}

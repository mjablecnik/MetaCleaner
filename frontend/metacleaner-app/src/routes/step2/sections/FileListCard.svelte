<script lang="ts">
	import { currentLocale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { UploadedFile } from '$lib/repositories/fileRepository';
	import FileListItemRisk from '../components/FileListItemRisk.svelte';

	interface Props {
		files?: UploadedFile[];
		onClearAll?: () => void;
		onRemoveFile?: (fileId: string) => void;
		onOptions?: () => void;
	}

	const { files = [], onClearAll, onRemoveFile, onOptions }: Props = $props();

	function tx(key: string, params: Record<string, unknown> = {}): string {
		currentLocale;
		const fn = (m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="flex flex-col gap-4 lg:gap-5">
	<div class="bg-navy-card rounded-2xl border border-gray-800 p-4 lg:p-6 flex flex-col gap-4 shadow-card">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="font-semibold text-base lg:text-lg text-white">{tx('step1.upload.title')}</h3>
			<div class="flex gap-1 lg:gap-1.5 flex-wrap justify-end">
				{#each ['JPG', 'PNG', 'HEIC', 'MP4', 'MOV'] as ext}
					<span
						class="px-1.5 lg:px-2 py-0.5 lg:py-1 rounded bg-navy-lighter text-[9px] lg:text-[10px] font-bold text-white uppercase"
					>{ext}</span>
				{/each}
			</div>
		</div>

		<!-- Compact Drop Zone -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="dashed-border-anim rounded-xl flex flex-col items-center justify-center gap-2.5 lg:gap-3 cursor-pointer py-5 lg:py-6 relative bg-navy-main/50"
			onclick={() => document.getElementById('fileInputStep2')?.click()}
		>
			<div
				class="w-10 h-10 rounded-full bg-navy-lighter flex items-center justify-center text-brand-blue text-lg shadow-glow-blue"
			>
				<i class="fa-solid fa-plus"></i>
			</div>
			<p class="text-xs text-text-muted">{tx('step2.files.addMore')}</p>
			<input type="file" id="fileInputStep2" multiple accept="image/*,video/*" class="hidden" />
		</div>

		<!-- File List -->
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between mb-1">
				<span class="text-sm font-semibold text-white">
					{tx('step1.files.title')}
					<span class="text-text-muted font-normal">({files.length})</span>
				</span>
				<button
					onclick={onClearAll}
					class="text-xs text-text-muted hover:text-brand-red transition-colors flex items-center gap-1 min-h-[44px] lg:min-h-0 px-2 lg:px-0"
				>
					<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>{tx('step1.files.clearAll')}
				</button>
			</div>
			<div class="flex flex-col gap-2 max-h-[260px] lg:max-h-[240px] overflow-y-auto pr-1">
				{#each files as file (file.id)}
					<FileListItemRisk {file} onRemove={() => onRemoveFile?.(file.id)} />
				{/each}
			</div>
		</div>

		<!-- Desktop Action Buttons -->
		<div class="hidden lg:flex gap-3 mt-1">
			<a
				href="/step3"
				class="flex-1 py-3.5 rounded-xl bg-brand-green text-white font-bold text-sm hover:bg-green-500 transition-all shadow-glow-green flex items-center justify-center gap-2"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i>
				{tx('step1.actions.startCleaning')}
			</a>
			<button
				onclick={onOptions}
				class="px-5 py-3.5 rounded-xl bg-navy-lighter border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
			>
				<i class="fa-solid fa-sliders"></i>
				{tx('step1.actions.options')}
			</button>
		</div>
	</div>
</div>

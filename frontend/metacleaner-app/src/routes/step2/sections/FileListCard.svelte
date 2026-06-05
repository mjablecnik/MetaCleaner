<script lang="ts">
	import { resolve } from '$app/paths';
	import { locale } from '$lib/locale.svelte';
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
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}
</script>

<div class="flex flex-col gap-4 lg:gap-5">
	<div
		class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6"
	>
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.upload.title')}</h3>
			<div class="flex flex-wrap justify-end gap-1 lg:gap-1.5">
				{#each ['JPG', 'PNG', 'HEIC', 'MP4', 'MOV'] as ext (ext)}
					<span
						class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-white uppercase lg:px-2 lg:py-1 lg:text-[10px]"
						>{ext}</span
					>
				{/each}
			</div>
		</div>

		<!-- Compact Drop Zone -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="dashed-border-anim relative flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl bg-navy-main/50 py-5 lg:gap-3 lg:py-6"
			onclick={() => document.getElementById('fileInputStep2')?.click()}
		>
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-lighter text-lg text-brand-blue shadow-glow-blue"
			>
				<i class="fa-solid fa-plus"></i>
			</div>
			<p class="text-xs text-text-muted">{tx('step2.files.addMore')}</p>
			<input type="file" id="fileInputStep2" multiple accept="image/*,video/*" class="hidden" />
		</div>

		<!-- File List -->
		<div class="flex flex-col gap-2">
			<div class="mb-1 flex items-center justify-between">
				<span class="text-sm font-semibold text-white">
					{tx('step1.files.title')}
					<span class="font-normal text-text-muted">({files.length})</span>
				</span>
				<button
					onclick={onClearAll}
					class="flex min-h-[44px] items-center gap-1 px-2 text-xs text-text-muted transition-colors hover:text-brand-red lg:min-h-0 lg:px-0"
				>
					<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>{tx('step1.files.clearAll')}
				</button>
			</div>
			<div class="flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[240px]">
				{#each files as file (file.id)}
					<FileListItemRisk {file} onRemove={() => onRemoveFile?.(file.id)} />
				{/each}
			</div>
		</div>

		<!-- Desktop Action Buttons -->
		<div class="mt-1 hidden gap-3 lg:flex">
			<a
				href={resolve('/step3')}
				class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-glow-green transition-all hover:bg-green-500"
			>
				<i class="fa-solid fa-wand-magic-sparkles"></i>
				{tx('step1.actions.startCleaning')}
			</a>
			<button
				onclick={onOptions}
				class="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
			>
				<i class="fa-solid fa-sliders"></i>
				{tx('step1.actions.options')}
			</button>
		</div>
	</div>
</div>

<!-- Mobile Fixed Bottom CTA -->
<div
	class="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-800 bg-navy-main px-4 py-4 lg:hidden"
>
	<div class="flex gap-3">
		<a
			href={resolve('/step3')}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-sm font-bold text-white shadow-glow-green transition-transform active:scale-95"
		>
			<i class="fa-solid fa-wand-magic-sparkles"></i>
			{tx('step1.actions.startCleaning')}
		</a>
		<button
			onclick={onOptions}
			aria-label={tx('step1.actions.options')}
			class="flex items-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter px-5 py-4 text-sm font-semibold text-white transition-transform active:scale-95"
		>
			<i class="fa-solid fa-sliders"></i>
		</button>
	</div>
</div>

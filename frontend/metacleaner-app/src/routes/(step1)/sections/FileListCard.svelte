<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import FileListItemRisk from '../components/FileListItemRisk.svelte';

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	const files = $derived(scannerStore.files);
</script>

<div
	class="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-navy-card p-4 shadow-card lg:p-6"
>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<span class="text-sm font-semibold text-white">
			{tx('step1.files.title')}
			<span class="font-normal text-text-muted">({files.length})</span>
		</span>
		<button
			onclick={() => scannerStore.clearFiles()}
			class="flex min-h-[44px] items-center gap-1 px-2 text-xs text-text-muted transition-colors hover:text-brand-red lg:min-h-0 lg:px-0"
		>
			<i class="fa-solid fa-trash mr-1 lg:mr-0"></i>{tx('step1.files.clearAll')}
		</button>
	</div>

	<!-- File List -->
	<div class="flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[300px]">
		{#each files as file (file.id)}
			<FileListItemRisk {file} onRemove={() => scannerStore.removeFile(file.id)} />
		{/each}
	</div>
</div>

<script lang="ts">
	import { locale } from '$lib/locale.svelte';
	import * as m from '$lib/paraglide/messages';
	import Card from '$lib/shared/elements/Card.svelte';
	import DropZone from '../components/DropZone.svelte';
	import Toast from '$lib/shared/components/Toast.svelte';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';

	interface Props {
		onOpenOptions: () => void;
	}

	let { onOpenOptions }: Props = $props();

	const FILE_FORMATS = ['JPG', 'PNG', 'HEIC', 'WEBP', 'GIF', 'AVIF', 'MP4', 'MOV', 'MKV'];

	const isScanning = $derived(scannerStore.isScanning);
	const scannedCount = $derived(scannerStore.aggregatedRisk.scannedCount);
	const fileCount = $derived(scannerStore.aggregatedRisk.fileCount);

	let showRejectionToast = $state(false);
	let rejectionMessage = $state('');
	let toastTimer: ReturnType<typeof setTimeout>;

	function tx(key: string, params: Record<string, unknown> = {}): string {
		void locale.current;
		const fn = (
			m as unknown as Record<string, ((p: Record<string, unknown>) => string) | undefined>
		)[key];
		return fn ? fn(params) : key;
	}

	$effect(() => {
		const rejection = scannerStore.lastRejection;
		if (!rejection) return;

		const parts: string[] = [];
		if (rejection.tooLarge > 0) {
			parts.push(
				tx('step1.upload.rejectedTooLarge', { count: rejection.tooLarge }) ||
					`${rejection.tooLarge} file(s) exceeded the 500 MB limit`
			);
		}
		if (rejection.unsupported > 0) {
			parts.push(
				tx('step1.upload.rejectedUnsupported', { count: rejection.unsupported }) ||
					`${rejection.unsupported} file(s) have an unsupported format`
			);
		}
		rejectionMessage = parts.join(' · ');
		showRejectionToast = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			showRejectionToast = false;
			scannerStore.clearRejection();
		}, 3500);
	});
</script>

<Card class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h3 class="text-base font-semibold text-white lg:text-lg">{tx('step1.upload.title')}</h3>
		<div class="flex flex-wrap justify-end gap-1 lg:gap-1.5">
			{#each FILE_FORMATS as ext (ext)}
				<span
					class="rounded bg-navy-lighter px-1.5 py-0.5 text-[9px] font-bold text-white uppercase lg:px-2 lg:py-1 lg:text-[10px]"
				>
					{ext}
				</span>
			{/each}
		</div>
	</div>

	<DropZone onFiles={(fl) => scannerStore.addFiles(fl)} />

	{#if isScanning}
		<div class="flex items-center gap-2 rounded-lg bg-navy-lighter px-3 py-2">
			<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-blue"></span>
			<span class="text-xs text-text-muted">
				{tx('step1.scan.progress', { scanned: scannedCount, total: fileCount })}
			</span>
		</div>
	{/if}

	<div class="mt-1 flex flex-col gap-2.5 lg:flex-row lg:gap-3">
		<button
			onclick={onOpenOptions}
			class="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-navy-lighter py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 lg:px-5"
		>
			<i class="fa-solid fa-sliders"></i>
			{tx('step1.actions.options')}
		</button>
	</div>
</Card>

<Toast message={rejectionMessage} show={showRejectionToast} />

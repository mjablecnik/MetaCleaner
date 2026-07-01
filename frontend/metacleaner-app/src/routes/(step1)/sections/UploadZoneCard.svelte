<script lang="ts">
	import { tx } from '$lib/shared/utils/i18n';
	import Card from '$lib/shared/elements/Card.svelte';
	import DropZone from '../components/DropZone.svelte';
	import Toast from '$lib/shared/components/Toast.svelte';
	import { scannerStore } from '$lib/scanner/scannerStore.svelte';
	import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '$lib/scanner/constants';

	const ALLOWED_EXTENSIONS = new Set([
		...Object.keys(IMAGE_EXTENSIONS),
		...Object.keys(VIDEO_EXTENSIONS)
	]);

	const ALLOWED_MIMES = new Set([
		'image/jpeg',
		'image/png',
		'image/heic',
		'image/heif',
		'image/avif',
		'image/tiff',
		'image/x-adobe-dng',
		'image/webp',
		'image/gif',
		'video/mp4',
		'video/quicktime',
		'video/x-msvideo',
		'video/avi',
		'video/x-matroska',
		'video/webm',
		'video/x-ms-wmv',
		'video/x-flv',
		'video/3gpp',
		'video/mpeg',
		'video/ogg',
		'video/mp2t'
	]);

	const ACCEPT = [...ALLOWED_EXTENSIONS].join(',');

	const MAX_FILE_SIZE = 500 * 1024 * 1024;

	function uniqueFormatChips(extensions: Record<string, string>): string[] {
		const seenFormats: string[] = [];
		const result: string[] = [];
		for (const [ext, fmt] of Object.entries(extensions)) {
			if (!seenFormats.includes(fmt)) {
				seenFormats.push(fmt);
				result.push(ext.slice(1).toUpperCase());
			}
		}
		return result;
	}

	const FILE_FORMATS = [
		...uniqueFormatChips(IMAGE_EXTENSIONS),
		...uniqueFormatChips(VIDEO_EXTENSIONS)
	];

	const hasFiles = $derived(scannerStore.hasFiles);
	const isScanning = $derived(scannerStore.isScanning);
	const scannedCount = $derived(scannerStore.aggregatedRisk.scannedCount);
	const fileCount = $derived(scannerStore.aggregatedRisk.fileCount);

	let showRejectionToast = $state(false);
	let rejectionMessage = $state('');
	let toastTimer: ReturnType<typeof setTimeout>;

	function isAllowedFile(file: File): boolean {
		const dotIdx = file.name.lastIndexOf('.');
		const ext = dotIdx !== -1 ? file.name.slice(dotIdx).toLowerCase() : '';
		return ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIMES.has(file.type);
	}

	function handleFiles(fileList: FileList) {
		const valid: File[] = [];
		let tooLarge = 0;
		let unsupported = 0;

		for (const file of fileList) {
			if (file.size > MAX_FILE_SIZE) {
				tooLarge++;
				continue;
			}
			if (!isAllowedFile(file)) {
				unsupported++;
				continue;
			}
			valid.push(file);
		}

		if (tooLarge > 0 || unsupported > 0) {
			const parts: string[] = [];
			if (tooLarge > 0) {
				parts.push(tx('step1.upload.rejectedTooLarge', { count: tooLarge }));
			}
			if (unsupported > 0) {
				parts.push(tx('step1.upload.rejectedUnsupported', { count: unsupported }));
			}
			rejectionMessage = parts.join(' · ');
			showRejectionToast = true;
			clearTimeout(toastTimer);
			toastTimer = setTimeout(() => {
				showRejectionToast = false;
			}, 3500);
		}

		if (valid.length > 0) {
			scannerStore.addFiles(valid);
		}
	}
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

	<DropZone compact={hasFiles} onFiles={handleFiles} accept={ACCEPT} />

	{#if isScanning}
		<div class="flex items-center gap-2 rounded-lg bg-navy-lighter px-3 py-2">
			<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-blue"></span>
			<span class="text-xs text-text-muted">
				{tx('step1.scan.progress', { scanned: scannedCount, total: fileCount })}
			</span>
		</div>
	{/if}
</Card>

<Toast message={rejectionMessage} show={showRejectionToast} />

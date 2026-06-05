<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorDetailBox from './ErrorDetailBox.svelte';

	const { Story } = defineMeta({
		title: 'Step4/ErrorDetailBox',
		component: ErrorDetailBox,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Single Error — JPEG Processing">
	<div class="w-full max-w-sm p-4">
		<ErrorDetailBox
			errorState={{
				errorCode: 'EXIF_PARSE_FAILURE',
				errorHexCode: '0xE001',
				errorTime: '14:32:07',
				failedFileId: 'file-001',
				phase: 'Metadata Extraction',
				filesCompleted: 2,
				totalFiles: 5,
				errorTypes: [],
				log: []
			}}
			failedFileName="vacation_photo.jpg"
		/>
	</div>
</Story>

<Story name="Single Error — PDF Stripping">
	<div class="w-full max-w-sm p-4">
		<ErrorDetailBox
			errorState={{
				errorCode: 'PDF_STRIP_FAILURE',
				errorHexCode: '0xE004',
				errorTime: '09:15:43',
				failedFileId: 'file-002',
				phase: 'Document Stripping',
				filesCompleted: 0,
				totalFiles: 3,
				errorTypes: [],
				log: []
			}}
			failedFileName="contract_document.pdf"
		/>
	</div>
</Story>

<Story name="Multiple Errors — Batch Processing">
	<div class="flex w-full max-w-sm flex-col gap-3 p-4">
		<ErrorDetailBox
			errorState={{
				errorCode: 'EXIF_PARSE_FAILURE',
				errorHexCode: '0xE001',
				errorTime: '14:32:07',
				failedFileId: 'file-001',
				phase: 'Metadata Extraction',
				filesCompleted: 2,
				totalFiles: 5,
				errorTypes: [],
				log: []
			}}
			failedFileName="vacation_photo.jpg"
		/>
		<ErrorDetailBox
			errorState={{
				errorCode: 'XMP_WRITE_ERROR',
				errorHexCode: '0xE002',
				errorTime: '14:32:19',
				failedFileId: 'file-003',
				phase: 'Write Back',
				filesCompleted: 3,
				totalFiles: 5,
				errorTypes: [],
				log: []
			}}
			failedFileName="portrait_2024.png"
		/>
		<ErrorDetailBox
			errorState={{
				errorCode: 'ID3_CORRUPT',
				errorHexCode: '0xE003',
				errorTime: '14:32:55',
				failedFileId: 'file-005',
				phase: 'Tag Removal',
				filesCompleted: 4,
				totalFiles: 5,
				errorTypes: [],
				log: []
			}}
			failedFileName="recording.mp3"
		/>
	</div>
</Story>

<Story name="Null Error State">
	<div class="w-full max-w-sm p-4">
		<ErrorDetailBox errorState={null} failedFileName="unknown_file.jpg" />
	</div>
</Story>

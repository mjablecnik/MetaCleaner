<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileListItem from './FileListItem.svelte';

	const { Story } = defineMeta({
		title: 'Components/FileListItem',
		component: FileListItem,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }],
			},
		},
	});

	const imageFile = {
		id: 'img-001',
		name: 'IMG_4821.jpg',
		size: '3.2 MB',
		extension: 'JPG',
		type: 'image' as const,
		metadataFieldCount: 12,
		hasGps: false,
		device: 'Canon EOS R5',
	};

	const imageFileWithGps = {
		id: 'img-002',
		name: 'photo_holiday_2024.heic',
		size: '8.7 MB',
		extension: 'HEIC',
		type: 'image' as const,
		metadataFieldCount: 18,
		hasGps: true,
		device: 'iPhone 15 Pro',
	};

	const videoFile = {
		id: 'vid-001',
		name: 'video_prague_walk.mp4',
		size: '142.5 MB',
		extension: 'MP4',
		type: 'video' as const,
		metadataFieldCount: 8,
		hasGps: false,
		device: 'H.264',
	};
</script>

<Story name="Image File">
	<FileListItem file={imageFile} />
</Story>

<Story name="Video File">
	<FileListItem file={videoFile} />
</Story>

<Story name="With GPS Indicator">
	<FileListItem file={imageFileWithGps}>
		{#snippet statusInfo()}
			<span class="flex items-center gap-1 text-brand-red text-[10px] lg:text-[11px] font-medium">
				<i class="fa-solid fa-location-dot text-[9px]"></i>
				GPS
			</span>
		{/snippet}
	</FileListItem>
</Story>

<Story name="With Remove Button">
	<FileListItem file={imageFile} onRemove={() => {}} />
</Story>

<Story name="Success State">
	<FileListItem file={imageFile} status="success" />
</Story>

<Story name="Error State">
	<FileListItem file={imageFile} status="error" />
</Story>

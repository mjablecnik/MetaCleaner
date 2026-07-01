<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InfoBox from './InfoBox.svelte';

	const { Story } = defineMeta({
		title: 'Elements/InfoBox',
		component: InfoBox,
		tags: ['autodocs'],
		parameters: {
			backgrounds: {
				default: 'dark',
				values: [{ name: 'dark', value: '#0a1628' }]
			}
		}
	});
</script>

<Story name="Blue">
	<InfoBox variant="blue" icon="fa-circle-info">
		Your files are processed securely and deleted after cleaning.
	</InfoBox>
</Story>

<Story name="Green">
	<InfoBox variant="green" icon="fa-circle-check">
		All metadata has been successfully removed from your files.
	</InfoBox>
</Story>

<Story name="Orange">
	<InfoBox variant="orange" icon="fa-triangle-exclamation">
		Some files contain GPS data that will be stripped during processing.
	</InfoBox>
</Story>

<Story name="Red">
	<InfoBox variant="red" icon="fa-circle-exclamation">
		Processing failed. Please try uploading your files again.
	</InfoBox>
</Story>

<Story name="Blue without Icon">
	<InfoBox variant="blue">
		Files are processed in your browser and never sent to any server.
	</InfoBox>
</Story>

<Story name="Green with Rich Content">
	<InfoBox variant="green" icon="fa-circle-check">
		<strong class="text-text-main">Cleaning complete!</strong> All EXIF metadata, GPS coordinates, and
		author information have been removed.
	</InfoBox>
</Story>

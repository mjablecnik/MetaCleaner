<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FeatureRow from './FeatureRow.svelte';

	const { Story } = defineMeta({
		title: 'Features/FeatureRow',
		component: FeatureRow,
		tags: ['autodocs'],
		args: {
			feature: {
				id: 'exif',
				number: 1,
				icon: 'fa-broom',
				color: 'brand-blue',
				layout: 'ltr',
				titleText: 'EXIF Metadata Removal',
				descKey: 'feature_exif_desc',
				formats: [
					{ icon: 'fa-location-dot', color: 'brand-red', key: 'feature_exif_fmt_gps' },
					{ icon: 'fa-mobile-screen', color: 'brand-orange', key: 'feature_exif_fmt_device' },
					{ icon: 'fa-user', color: 'brand-blue', key: 'feature_exif_fmt_author' },
					{ icon: 'fa-calendar', color: 'brand-green', key: 'feature_exif_fmt_datetime' },
					{ icon: 'fa-code', color: 'text-muted', key: 'feature_exif_fmt_software' },
					{ icon: 'fa-camera', color: 'brand-blue', key: 'feature_exif_fmt_camera' }
				]
			}
		}
	});
</script>

<!-- LTR layout: format pills + ExifIllustration -->
<Story
	name="LTR — Formats + Illustration"
	args={{
		feature: {
			id: 'exif',
			number: 1,
			icon: 'fa-broom',
			color: 'brand-blue',
			layout: 'ltr',
			titleText: 'EXIF Metadata Removal',
			descKey: 'feature_exif_desc',
			formats: [
				{ icon: 'fa-location-dot', color: 'brand-red', key: 'feature_exif_fmt_gps' },
				{ icon: 'fa-mobile-screen', color: 'brand-orange', key: 'feature_exif_fmt_device' },
				{ icon: 'fa-user', color: 'brand-blue', key: 'feature_exif_fmt_author' },
				{ icon: 'fa-calendar', color: 'brand-green', key: 'feature_exif_fmt_datetime' },
				{ icon: 'fa-code', color: 'text-muted', key: 'feature_exif_fmt_software' },
				{ icon: 'fa-camera', color: 'brand-blue', key: 'feature_exif_fmt_camera' }
			]
		}
	}}
/>

<!-- RTL layout: bullet list + image URL -->
<Story
	name="RTL — Bullets + Image"
	args={{
		feature: {
			id: 'ai',
			number: 2,
			icon: 'fa-robot',
			color: 'brand-orange',
			layout: 'rtl',
			titleText: 'AI Tool Detection',
			descKey: 'feature_ai_desc',
			bullets: [
				'feature_ai_bullet1',
				'feature_ai_bullet2',
				'feature_ai_bullet3',
				'feature_ai_bullet4'
			],
			image: {
				src: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/13e0bf6e0f-aa80ce2947ef80f51f20.png',
				altKey: 'feature_ai_img_alt'
			}
		}
	}}
/>

<!-- LTR layout: bullet list + C2paIllustration -->
<Story
	name="LTR — Bullets + Illustration"
	args={{
		feature: {
			id: 'c2pa',
			number: 3,
			icon: 'fa-stamp',
			color: 'brand-green',
			layout: 'ltr',
			titleText: 'C2PA Removal',
			descKey: 'feature_c2pa_desc',
			bullets: ['feature_c2pa_bullet1', 'feature_c2pa_bullet2', 'feature_c2pa_bullet3']
		}
	}}
/>

<!-- LTR layout: format pills + image URL -->
<Story
	name="LTR — Formats + Image"
	args={{
		feature: {
			id: 'batch',
			number: 5,
			icon: 'fa-layer-group',
			color: 'brand-blue',
			layout: 'ltr',
			titleText: 'Batch Processing',
			descKey: 'feature_batch_desc',
			formats: [
				{ icon: 'fa-images', color: 'brand-blue', label: 'JPG, PNG, HEIC' },
				{ icon: 'fa-file-pdf', color: 'brand-red', key: 'feature_batch_fmt_pdf' },
				{ icon: 'fa-file-video', color: 'brand-orange', key: 'feature_batch_fmt_video' },
				{ icon: 'fa-folder-open', color: 'brand-green', key: 'feature_batch_fmt_folders' }
			],
			image: {
				src: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/086bb62676-9932975e36639131dcde.png',
				altKey: 'feature_batch_img_alt'
			}
		}
	}}
/>

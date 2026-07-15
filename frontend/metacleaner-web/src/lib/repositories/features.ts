export interface FormatItem {
	icon: string;
	color: string;
	key?: string;
	label?: string;
}

export interface Feature {
	id: string;
	number: number;
	icon: string;
	color: string;
	layout: 'ltr' | 'rtl';
	titleText: string;
	descKey: string;
	bullets?: string[];
	formats?: FormatItem[];
}

export function featuresRepository(): Feature[] {
	return [
		{
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
		},
		{
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
			]
		},
		{
			id: 'c2pa',
			number: 3,
			icon: 'fa-stamp',
			color: 'brand-green',
			layout: 'ltr',
			titleText: 'C2PA Removal',
			descKey: 'feature_c2pa_desc',
			bullets: ['feature_c2pa_bullet1', 'feature_c2pa_bullet2', 'feature_c2pa_bullet3']
		},
		{
			id: 'risk',
			number: 4,
			icon: 'fa-shield-halved',
			color: 'brand-red',
			layout: 'rtl',
			titleText: 'Risk Scanner',
			descKey: 'feature_risk_desc',
			bullets: [
				'feature_risk_bullet1',
				'feature_risk_bullet2',
				'feature_risk_bullet3',
				'feature_risk_bullet4'
			]
		},
		{
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
			]
		},
		{
			id: 'pdf',
			number: 6,
			icon: 'fa-file-pdf',
			color: 'brand-blue',
			layout: 'rtl',
			titleText: 'PDF Report',
			descKey: 'feature_pdf_desc',
			bullets: [
				'feature_pdf_bullet1',
				'feature_pdf_bullet2',
				'feature_pdf_bullet3',
				'feature_pdf_bullet4'
			]
		}
	];
}

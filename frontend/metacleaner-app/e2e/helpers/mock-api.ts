import type { Page } from 'playwright/test';

export const mockFiles = [
	{
		id: 'file-1',
		name: 'photo.jpg',
		size: 2048576,
		extension: 'jpg',
		type: 'image',
		format: 'JPEG'
	},
	{
		id: 'file-2',
		name: 'document.png',
		size: 1024000,
		extension: 'png',
		type: 'image',
		format: 'PNG'
	},
	{
		id: 'file-3',
		name: 'vacation.jpg',
		size: 3145728,
		extension: 'jpg',
		type: 'image',
		format: 'JPEG'
	}
];

export const mockJob = {
	jobId: 'job-001',
	status: 'processing',
	totalFiles: 3,
	createdAt: '2026-01-15T10:30:00Z'
};

export const mockJobCompleted = {
	jobId: 'job-001',
	status: 'completed',
	totalFiles: 3,
	filesCompleted: 3,
	fieldsRemoved: 42,
	totalTimeSeconds: 12,
	createdAt: '2026-01-15T10:30:00Z',
	completedAt: '2026-01-15T10:30:12Z'
};

export const mockReports = {
	summary: {
		totalReports: 5,
		fieldsRemoved: 234,
		filesProcessed: 18,
		gpsRemoved: 7
	},
	reports: [
		{
			id: 'rpt-001',
			reportId: 'RPT-001',
			date: '2026-01-15',
			time: '10:30',
			duration: '12s',
			fileCount: 3,
			fileTypes: 'JPEG, PNG',
			type: 'image',
			gps: true,
			fields: 42,
			tags: ['GPS', 'EXIF'],
			iconColor: 'green'
		}
	]
};

// Matches what mockCleaningService._generateMockReportDetail() returns (in-memory, no HTTP)
export const mockReportDetail = {
	reportId: 'MC-2025-001',
	date: '4. 6. 2025 · 14:32',
	filesProcessed: 8,
	fieldsRemoved: 247,
	gpsLocationsRemoved: 5,
	totalTimeSeconds: 134,
	chartData: [
		{ label: 'GPS Data', fields: 42, percentage: 17 },
		{ label: 'EXIF Data', fields: 138, percentage: 56 },
		{ label: 'XMP Data', fields: 67, percentage: 27 }
	],
	files: [
		{
			name: 'photo_001.jpg',
			extension: '.jpg',
			sizeMB: '2.1 MB',
			format: 'JPEG',
			device: 'iPhone 15 Pro',
			type: 'image',
			iconColor: 'green',
			hasGps: true,
			fieldsRemoved: 25,
			metadata: {
				gpsFields: [
					{ label: 'GPS Latitude', value: '50.0755° N' },
					{ label: 'GPS Longitude', value: '14.4378° E' },
					{ label: 'GPS Altitude', value: '285 m' }
				],
				exifFields: [
					{ label: 'Make', value: 'Apple' },
					{ label: 'Model', value: 'iPhone 15 Pro' },
					{ label: 'DateTimeOriginal', value: '2025:06:04 14:22:18' },
					{ label: 'ExposureTime', value: '1/120 s', moreCount: 12 }
				],
				xmpFields: [
					{ label: 'xmp:Creator', value: 'iPhone' },
					{ label: 'xmp:CreateDate', value: '2025-06-04T14:22:18' }
				],
				totalRemoved: 25
			}
		}
	]
};

export async function mockUploadApi(page: Page) {
	await page.route('**/api/upload', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ files: mockFiles })
			});
		} else {
			await route.continue();
		}
	});
}

export async function mockJobsApi(page: Page) {
	await page.route('**/api/jobs', async (route) => {
		if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockJob)
			});
		} else {
			await route.continue();
		}
	});

	await page.route('**/api/jobs/*', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockJobCompleted)
			});
		} else {
			await route.continue();
		}
	});
}

export async function mockWebSocketProgress(page: Page, outcome: 'success' | 'error' = 'success') {
	await page.routeWebSocket('**/api/jobs/*/progress', (ws) => {
		const send = (data: object) => ws.send(JSON.stringify(data));

		send({ type: 'job_progress', overallProgress: 33, filesCompleted: 1, totalFiles: 3 });

		if (outcome === 'success') {
			send({
				type: 'file_complete',
				fileId: 'file-1',
				fieldsRemoved: 14,
				gpsRemoved: true
			});
			send({
				type: 'file_complete',
				fileId: 'file-2',
				fieldsRemoved: 15,
				gpsRemoved: false
			});
			send({
				type: 'file_complete',
				fileId: 'file-3',
				fieldsRemoved: 13,
				gpsRemoved: true
			});
			send({
				type: 'job_complete',
				filesCompleted: 3,
				fieldsRemoved: 42,
				reportId: 'rpt-001',
				totalTimeSeconds: 12,
				gpsLocationsRemoved: 2
			});
		} else {
			send({
				type: 'job_error',
				error: 'Processing failed'
			});
		}
	});
}

export async function mockReportsApi(page: Page) {
	await page.route('**/api/reports', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockReports)
			});
		} else {
			await route.continue();
		}
	});

	await page.route('**/api/reports/*', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(mockReportDetail)
			});
		} else {
			await route.continue();
		}
	});
}

export async function mockDownloadApi(page: Page) {
	await page.route('**/api/files/*/download', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				headers: {
					'Content-Type': 'image/jpeg',
					'Content-Disposition': 'attachment; filename="cleaned_photo.jpg"'
				},
				body: Buffer.from('fake-cleaned-image-content')
			});
		} else {
			await route.continue();
		}
	});
}

export async function mockAllApis(page: Page) {
	await mockUploadApi(page);
	await mockJobsApi(page);
	await mockReportsApi(page);
	await mockDownloadApi(page);
}

export const mockSubscriptionFree = {
	plan_id: 'free',
	status: 'free',
	billing_period: null,
	current_period_start: null,
	current_period_end: null,
	scheduled_plan_id: null,
	scheduled_billing_period: null,
	scheduled_change_date: null
};

export const mockSubscriptionPro = {
	plan_id: 'pro',
	status: 'active',
	billing_period: 'monthly',
	current_period_start: '2026-01-01',
	current_period_end: '2026-02-01',
	scheduled_plan_id: null,
	scheduled_billing_period: null,
	scheduled_change_date: null
};

export const mockCredits = {
	total_credits: 3,
	subscription_credits: 3,
	purchased_credits: 0
};

export const mockCreditsPro = {
	total_credits: 100,
	subscription_credits: 100,
	purchased_credits: 0
};

export const mockApiKey = {
	id: 'key-1',
	name: 'My Test Key',
	key_prefix: 'mc_live_',
	key_suffix: 'abc123',
	status: 'active' as const,
	note: 'Used for integration tests',
	created_at: '2026-01-15T10:00:00Z',
	last_used_at: null,
	revoked_at: null
};

export async function mockBillingApi(
	page: Page,
	subscription = mockSubscriptionFree,
	credits = mockCredits
) {
	await page.route('**/api/billing/subscription', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(subscription)
			});
		} else {
			await route.continue();
		}
	});

	await page.route('**/api/billing/credits', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(credits)
			});
		} else {
			await route.continue();
		}
	});
}

export async function mockApiKeysListApi(page: Page) {
	await page.route('**/api/keys', async (route) => {
		if (route.request().method() === 'GET') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify([mockApiKey])
			});
		} else if (route.request().method() === 'POST') {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					key: 'mc_live_full_key_value_shown_once',
					api_key: { ...mockApiKey, id: 'key-new', name: 'New Key' }
				})
			});
		} else {
			await route.continue();
		}
	});
}

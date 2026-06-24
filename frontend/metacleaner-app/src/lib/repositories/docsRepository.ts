export interface DocsSection {
	id: string;
	icon: string;
	titleKey: string;
	subtitleKey: string;
}

export interface FeatureCardData {
	icon: string;
	iconColor: string;
	titleKey: string;
	descriptionKey: string;
}

export interface QuickStartStep {
	number: number;
	titleKey: string;
	descriptionKey: string;
	codeSnippets: { text: string; color: string }[];
	isLast?: boolean;
}

export interface CodeExample {
	id: string;
	code: string;
	displayHtml: string;
}

export interface ErrorEntry {
	status: number;
	code: string;
	descriptionKey: string;
	solutionKey: string;
}

export interface EndpointParam {
	name: string;
	type: string;
	required?: boolean;
	default?: string;
	descriptionKey: string;
}

export interface EndpointResponse {
	status: number;
	labelKey: string;
	variant: 'success' | 'error';
	body: string;
}

export interface EndpointData {
	id: string;
	method: 'GET' | 'POST' | 'DEL';
	path: string;
	shortDescriptionKey: string;
	descriptionKey: string;
	headers: CodeExample;
	params: EndpointParam[];
	optionsParams?: EndpointParam[];
	statusValues?: string[];
	curlExample: CodeExample;
	responses: EndpointResponse[];
	isMinimal?: boolean;
	placeholderKey?: string;
}

export interface SidebarSection {
	id: string;
	icon: string;
	labelKey: string;
}

export interface SidebarEndpoint {
	id: string;
	method: 'GET' | 'POST' | 'DEL';
	label: string;
	group: 'fileProcessing' | 'reports' | 'account' | 'system';
}

export interface DocsConfig {
	apiVersion: string;
	baseUrl: string;
}

export function getDocsConfig(): DocsConfig {
	return {
		apiVersion: 'v1',
		baseUrl: 'https://api.metacleaner.com'
	};
}

export function getSidebarSections(): SidebarSection[] {
	return [
		{ id: 'sec-intro', icon: 'fa-house', labelKey: 'docs.sidebar.intro' },
		{ id: 'sec-auth', icon: 'fa-lock', labelKey: 'docs.sidebar.auth' },
		{ id: 'sec-errors', icon: 'fa-triangle-exclamation', labelKey: 'docs.sidebar.errors' },
		{ id: 'sec-endpoints', icon: 'fa-plug', labelKey: 'docs.sidebar.endpoints' }
	];
}

export function getSidebarEndpoints(): SidebarEndpoint[] {
	return [
		{ id: 'ep-upload', method: 'POST', label: 'Upload', group: 'fileProcessing' },
		{ id: 'ep-clean', method: 'POST', label: 'Create Job', group: 'fileProcessing' },
		{ id: 'ep-status', method: 'GET', label: 'Job Status', group: 'fileProcessing' },
		{ id: 'ep-job-progress', method: 'GET', label: 'Job Progress', group: 'fileProcessing' },
		{ id: 'ep-job-download', method: 'GET', label: 'Job Download', group: 'fileProcessing' },
		{ id: 'ep-download', method: 'GET', label: 'File Download', group: 'fileProcessing' },
		{ id: 'ep-reports-list', method: 'GET', label: 'List Reports', group: 'reports' },
		{ id: 'ep-report-detail', method: 'GET', label: 'Report Detail', group: 'reports' },
		{ id: 'ep-report-pdf', method: 'GET', label: 'Report PDF', group: 'reports' },
		{ id: 'ep-account', method: 'GET', label: 'Account Info', group: 'account' },
		{ id: 'ep-health', method: 'GET', label: 'Health Check', group: 'system' }
	];
}

export function getFeatureCards(): FeatureCardData[] {
	return [
		{
			icon: 'fa-upload',
			iconColor: 'text-brand-blue',
			titleKey: 'docs.intro.feature.upload.title',
			descriptionKey: 'docs.intro.feature.upload.desc'
		},
		{
			icon: 'fa-broom',
			iconColor: 'text-brand-green',
			titleKey: 'docs.intro.feature.clean.title',
			descriptionKey: 'docs.intro.feature.clean.desc'
		},
		{
			icon: 'fa-clock-rotate-left',
			iconColor: 'text-brand-orange',
			titleKey: 'docs.intro.feature.async.title',
			descriptionKey: 'docs.intro.feature.async.desc'
		}
	];
}

export function getQuickStartSteps(): QuickStartStep[] {
	return [
		{
			number: 1,
			titleKey: 'docs.intro.quickStart.step1.title',
			descriptionKey: 'docs.intro.quickStart.step1.desc',
			codeSnippets: [
				{ text: 'POST', color: 'text-brand-blue' },
				{ text: ' /api/upload', color: 'text-white' },
				{ text: '  →  ', color: 'text-muted' },
				{ text: 'file_id', color: 'text-brand-green' }
			]
		},
		{
			number: 2,
			titleKey: 'docs.intro.quickStart.step2.title',
			descriptionKey: 'docs.intro.quickStart.step2.desc',
			codeSnippets: [
				{ text: 'POST', color: 'text-brand-blue' },
				{ text: ' /api/jobs', color: 'text-white' },
				{ text: '  →  ', color: 'text-muted' },
				{ text: 'job_id', color: 'text-brand-green' }
			]
		},
		{
			number: 3,
			titleKey: 'docs.intro.quickStart.step3.title',
			descriptionKey: 'docs.intro.quickStart.step3.desc',
			codeSnippets: [
				{ text: 'GET', color: 'text-brand-green' },
				{ text: ' /api/jobs/{id}', color: 'text-white' },
				{ text: '  →  ', color: 'text-muted' },
				{ text: 'completed', color: 'text-brand-green' }
			]
		},
		{
			number: 4,
			titleKey: 'docs.intro.quickStart.step4.title',
			descriptionKey: 'docs.intro.quickStart.step4.desc',
			codeSnippets: [
				{ text: 'GET', color: 'text-brand-green' },
				{ text: ' /api/files/{id}/download', color: 'text-white' }
			],
			isLast: true
		}
	];
}

export function getSupportedFormats(): string[] {
	return ['JPG', 'PNG', 'HEIC', 'WEBP', 'MP4', 'MOV'];
}

export function getErrorEntries(): ErrorEntry[] {
	return [
		{
			status: 400,
			code: 'INVALID_INPUT',
			descriptionKey: 'docs.errors.entry.invalidInput.desc',
			solutionKey: 'docs.errors.entry.invalidInput.solution'
		},
		{
			status: 400,
			code: 'UNSUPPORTED_FORMAT',
			descriptionKey: 'docs.errors.entry.unsupportedFormat.desc',
			solutionKey: 'docs.errors.entry.unsupportedFormat.solution'
		},
		{
			status: 401,
			code: 'UNAUTHORIZED',
			descriptionKey: 'docs.errors.entry.unauthorized.desc',
			solutionKey: 'docs.errors.entry.unauthorized.solution'
		},
		{
			status: 403,
			code: 'FORBIDDEN',
			descriptionKey: 'docs.errors.entry.forbidden.desc',
			solutionKey: 'docs.errors.entry.forbidden.solution'
		},
		{
			status: 404,
			code: 'NOT_FOUND',
			descriptionKey: 'docs.errors.entry.notFound.desc',
			solutionKey: 'docs.errors.entry.notFound.solution'
		},
		{
			status: 422,
			code: 'VALIDATION_ERROR',
			descriptionKey: 'docs.errors.entry.validationError.desc',
			solutionKey: 'docs.errors.entry.validationError.solution'
		},
		{
			status: 429,
			code: 'RATE_LIMIT_EXCEEDED',
			descriptionKey: 'docs.errors.entry.rateLimit.desc',
			solutionKey: 'docs.errors.entry.rateLimit.solution'
		},
		{
			status: 500,
			code: 'INTERNAL_ERROR',
			descriptionKey: 'docs.errors.entry.internalError.desc',
			solutionKey: 'docs.errors.entry.internalError.solution'
		},
		{
			status: 503,
			code: 'SERVICE_UNAVAILABLE',
			descriptionKey: 'docs.errors.entry.serviceUnavailable.desc',
			solutionKey: 'docs.errors.entry.serviceUnavailable.solution'
		}
	];
}

export function getEndpoints(): EndpointData[] {
	return [
		// ── File Processing ────────────────────────────────────────────────────
		{
			id: 'ep-upload',
			method: 'POST',
			path: '/api/upload',
			shortDescriptionKey: 'docs.endpoint.upload.short',
			descriptionKey: 'docs.endpoint.upload.desc',
			headers: {
				id: 'upload-headers',
				code: 'Content-Type: multipart/form-data\nAuthorization: Bearer YOUR_API_KEY',
				displayHtml: 'Content-Type: multipart/form-data\nAuthorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'file',
					type: 'File',
					required: true,
					descriptionKey: 'docs.endpoint.upload.param.file.desc'
				}
			],
			curlExample: {
				id: 'upload-curl',
				code: `curl -X POST https://api.metacleaner.com/api/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@photo.jpg"`,
				displayHtml: `curl -X POST https://api.metacleaner.com/api/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@photo.jpg"`
			},
			responses: [
				{
					status: 201,
					labelKey: 'docs.endpoint.upload.response.success.label',
					variant: 'success',
					body: `{
  "status": "success",
  "file_id": "f_abc123xyz",
  "filename": "photo.jpg",
  "size": 2048576,
  "format": "jpg",
  "created_at": "2024-01-15T10:30:00Z"
}`
				},
				{
					status: 400,
					labelKey: 'docs.endpoint.upload.response.error.label',
					variant: 'error',
					body: `{
  "status": "error",
  "code": "INVALID_INPUT",
  "message": "No file provided in the request body"
}`
				}
			]
		},
		{
			id: 'ep-clean',
			method: 'POST',
			path: '/api/jobs',
			shortDescriptionKey: 'docs.endpoint.clean.short',
			descriptionKey: 'docs.endpoint.clean.desc',
			headers: {
				id: 'clean-headers',
				code: 'Content-Type: application/json\nAuthorization: Bearer YOUR_API_KEY',
				displayHtml: 'Content-Type: application/json\nAuthorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'file_ids',
					type: 'string[]',
					required: true,
					descriptionKey: 'docs.endpoint.clean.param.fileIds.desc'
				}
			],
			optionsParams: [
				{
					name: 'strip_gps',
					type: 'boolean',
					default: 'true',
					descriptionKey: 'docs.endpoint.clean.opt.stripGps.desc'
				},
				{
					name: 'strip_exif',
					type: 'boolean',
					default: 'true',
					descriptionKey: 'docs.endpoint.clean.opt.stripExif.desc'
				},
				{
					name: 'strip_iptc',
					type: 'boolean',
					default: 'true',
					descriptionKey: 'docs.endpoint.clean.opt.stripIptc.desc'
				}
			],
			curlExample: {
				id: 'clean-curl',
				code: `curl -X POST https://api.metacleaner.com/api/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"file_ids":["f_abc123xyz","f_def456uvw"],"options":{"strip_gps":true,"strip_exif":true}}'`,
				displayHtml: `curl -X POST https://api.metacleaner.com/api/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"file_ids":["f_abc123xyz","f_def456uvw"],"options":{"strip_gps":true,"strip_exif":true}}'`
			},
			responses: [
				{
					status: 202,
					labelKey: 'docs.endpoint.clean.response.success.label',
					variant: 'success',
					body: `{
  "status": "accepted",
  "job_id": "job_def456uvw",
  "file_ids": ["f_abc123xyz", "f_def456uvw"],
  "created_at": "2024-01-15T10:30:05Z"
}`
				},
				{
					status: 404,
					labelKey: 'docs.endpoint.clean.response.error.label',
					variant: 'error',
					body: `{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "One or more files not found or do not belong to your account"
}`
				}
			]
		},
		{
			id: 'ep-status',
			method: 'GET',
			path: '/api/jobs/{id}',
			shortDescriptionKey: 'docs.endpoint.status.short',
			descriptionKey: 'docs.endpoint.status.desc',
			headers: {
				id: 'status-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.status.param.jobId.desc'
				}
			],
			statusValues: ['pending', 'processing', 'completed', 'failed'],
			curlExample: {
				id: 'status-curl',
				code: `curl https://api.metacleaner.com/api/jobs/job_def456uvw \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
				displayHtml: `curl https://api.metacleaner.com/api/jobs/job_def456uvw \\
  -H "Authorization: Bearer YOUR_API_KEY"`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.status.response.success.label',
					variant: 'success',
					body: `{
  "status": "completed",
  "job_id": "job_def456uvw",
  "file_ids": ["f_abc123xyz"],
  "cleaned_file_ids": ["f_ghi789rst"],
  "fields_removed": 42,
  "gps_removed": true,
  "completed_at": "2024-01-15T10:30:12Z"
}`
				},
				{
					status: 404,
					labelKey: 'docs.endpoint.status.response.error.label',
					variant: 'error',
					body: `{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Job not found or does not belong to your account"
}`
				}
			]
		},
		{
			id: 'ep-job-progress',
			method: 'GET',
			path: '/api/jobs/{id}/progress',
			shortDescriptionKey: 'docs.endpoint.jobProgress.short',
			descriptionKey: 'docs.endpoint.jobProgress.desc',
			headers: {
				id: 'job-progress-headers',
				code: 'Authorization: Bearer YOUR_API_KEY (via ?token= query parameter)',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY (via ?token= query parameter)'
			},
			params: [
				{
					name: 'id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.jobProgress.param.id.desc'
				},
				{
					name: 'token',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.jobProgress.param.token.desc'
				}
			],
			statusValues: [
				'file_progress',
				'file_complete',
				'file_error',
				'job_complete',
				'job_error',
				'report_ready'
			],
			curlExample: {
				id: 'job-progress-curl',
				code: `const ws = new WebSocket(
  'wss://api.metacleaner.com/api/jobs/job_def456uvw/progress?token=YOUR_API_KEY'
);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data.overallProgress);
};`,
				displayHtml: `const ws = new WebSocket(
  'wss://api.metacleaner.com/api/jobs/job_def456uvw/progress?token=YOUR_API_KEY'
);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data.overallProgress);
};`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.jobProgress.response.fileProgress.label',
					variant: 'success',
					body: `{
  "type": "file_progress",
  "fileId": "f_abc123xyz",
  "status": "processing",
  "overallProgress": 45,
  "fieldsRemoved": 12,
  "filesCompleted": 0,
  "totalFiles": 2
}`
				},
				{
					status: 200,
					labelKey: 'docs.endpoint.jobProgress.response.fileComplete.label',
					variant: 'success',
					body: `{
  "type": "file_complete",
  "fileId": "f_abc123xyz",
  "status": "completed",
  "overallProgress": 50,
  "fieldsRemoved": 38,
  "filesCompleted": 1,
  "totalFiles": 2
}`
				},
				{
					status: 200,
					labelKey: 'docs.endpoint.jobProgress.response.jobComplete.label',
					variant: 'success',
					body: `{
  "type": "job_complete",
  "fileId": "",
  "status": "completed",
  "overallProgress": 100,
  "fieldsRemoved": 76,
  "filesCompleted": 2,
  "totalFiles": 2
}`
				},
				{
					status: 401,
					labelKey: 'docs.endpoint.jobProgress.response.error401.label',
					variant: 'error',
					body: `{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid token"
}`
				},
				{
					status: 400,
					labelKey: 'docs.endpoint.jobProgress.response.error400.label',
					variant: 'error',
					body: `{
  "error": "BAD_REQUEST",
  "message": "Missing job id"
}`
				}
			]
		},
		{
			id: 'ep-job-download',
			method: 'GET',
			path: '/api/jobs/{id}/download',
			shortDescriptionKey: 'docs.endpoint.jobDownload.short',
			descriptionKey: 'docs.endpoint.jobDownload.desc',
			headers: {
				id: 'job-download-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.jobDownload.param.id.desc'
				}
			],
			curlExample: {
				id: 'job-download-curl',
				code: `curl https://api.metacleaner.com/api/jobs/job_def456uvw/download \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o cleaned.zip`,
				displayHtml: `curl https://api.metacleaner.com/api/jobs/job_def456uvw/download \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o cleaned.zip`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.jobDownload.response.success.label',
					variant: 'success',
					body: `Content-Type: application/zip
Content-Disposition: attachment; filename="cleaned.zip"

[binary ZIP archive]`
				},
				{
					status: 404,
					labelKey: 'docs.endpoint.jobDownload.response.error.label',
					variant: 'error',
					body: `{
  "error": "NOT_FOUND",
  "message": "Job not found or does not belong to your account"
}`
				}
			]
		},
		{
			id: 'ep-download',
			method: 'GET',
			path: '/api/files/{id}/download',
			shortDescriptionKey: 'docs.endpoint.download.short',
			descriptionKey: 'docs.endpoint.download.desc',
			headers: {
				id: 'download-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.download.param.id.desc'
				}
			],
			curlExample: {
				id: 'download-curl',
				code: `curl https://api.metacleaner.com/api/files/f_ghi789rst/download \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o cleaned_photo.jpg`,
				displayHtml: `curl https://api.metacleaner.com/api/files/f_ghi789rst/download \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o cleaned_photo.jpg`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.download.response.success.label',
					variant: 'success',
					body: `Content-Type: image/jpeg
Content-Disposition: attachment; filename="cleaned_photo.jpg"

[binary file content]`
				},
				{
					status: 404,
					labelKey: 'docs.endpoint.download.response.error.label',
					variant: 'error',
					body: `{
  "error": "NOT_FOUND",
  "message": "File not found or does not belong to your account"
}`
				}
			]
		},
		// ── Reports ────────────────────────────────────────────────────────────
		{
			id: 'ep-reports-list',
			method: 'GET',
			path: '/api/reports',
			shortDescriptionKey: 'docs.endpoint.reportsList.short',
			descriptionKey: 'docs.endpoint.reportsList.desc',
			headers: {
				id: 'reports-list-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [],
			curlExample: {
				id: 'reports-list-curl',
				code: `curl https://api.metacleaner.com/api/reports \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
				displayHtml: `curl https://api.metacleaner.com/api/reports \\
  -H "Authorization: Bearer YOUR_API_KEY"`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.reportsList.response.success.label',
					variant: 'success',
					body: `[
  {
    "id": "rpt_abc123",
    "created_at": "2024-01-15T10:30:12Z",
    "file_count": 3,
    "fields_removed": 127,
    "gps_removed": 2,
    "status": "completed"
  }
]`
				},
				{
					status: 401,
					labelKey: 'docs.endpoint.reportsList.response.error401.label',
					variant: 'error',
					body: `{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid Authorization header"
}`
				}
			]
		},
		{
			id: 'ep-report-detail',
			method: 'GET',
			path: '/api/reports/{id}',
			shortDescriptionKey: 'docs.endpoint.reportDetail.short',
			descriptionKey: 'docs.endpoint.reportDetail.desc',
			headers: {
				id: 'report-detail-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.reportDetail.param.id.desc'
				}
			],
			curlExample: {
				id: 'report-detail-curl',
				code: `curl https://api.metacleaner.com/api/reports/rpt_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
				displayHtml: `curl https://api.metacleaner.com/api/reports/rpt_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.reportDetail.response.success.label',
					variant: 'success',
					body: `{
  "id": "rpt_abc123",
  "created_at": "2024-01-15T10:30:12Z",
  "files": [
    {
      "file_id": "f_abc123xyz",
      "filename": "photo.jpg",
      "fields_removed": 42,
      "gps_removed": true,
      "status": "completed"
    }
  ],
  "total_fields_removed": 42,
  "total_gps_removed": 1,
  "status": "completed"
}`
				},
				{
					status: 404,
					labelKey: 'docs.endpoint.reportDetail.response.error.label',
					variant: 'error',
					body: `{
  "error": "NOT_FOUND",
  "message": "Report not found or does not belong to your account"
}`
				}
			]
		},
		{
			id: 'ep-report-pdf',
			method: 'GET',
			path: '/api/reports/{id}/pdf',
			shortDescriptionKey: 'docs.endpoint.reportPdf.short',
			descriptionKey: 'docs.endpoint.reportPdf.desc',
			headers: {
				id: 'report-pdf-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.reportPdf.param.id.desc'
				}
			],
			curlExample: {
				id: 'report-pdf-curl',
				code: `curl https://api.metacleaner.com/api/reports/rpt_abc123/pdf \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
				displayHtml: `curl https://api.metacleaner.com/api/reports/rpt_abc123/pdf \\
  -H "Authorization: Bearer YOUR_API_KEY"`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.reportPdf.response.success.label',
					variant: 'success',
					body: `{
  "url": "https://storage.metacleaner.com/reports/rpt_abc123.pdf?token=..."
}`
				},
				{
					status: 404,
					labelKey: 'docs.endpoint.reportPdf.response.error.label',
					variant: 'error',
					body: `{
  "error": "NOT_FOUND",
  "message": "Report not found or does not belong to your account"
}`
				}
			]
		},
		// ── Account ────────────────────────────────────────────────────────────
		{
			id: 'ep-account',
			method: 'GET',
			path: '/api/account',
			shortDescriptionKey: 'docs.endpoint.account.short',
			descriptionKey: 'docs.endpoint.account.desc',
			headers: {
				id: 'account-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [],
			curlExample: {
				id: 'account-curl',
				code: `curl https://api.metacleaner.com/api/account \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
				displayHtml: `curl https://api.metacleaner.com/api/account \\
  -H "Authorization: Bearer YOUR_API_KEY"`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.account.response.success.label',
					variant: 'success',
					body: `{
  "credits_remaining": 450,
  "plan": "pro",
  "rate_limit_rpm": 60
}`
				},
				{
					status: 401,
					labelKey: 'docs.endpoint.account.response.error401.label',
					variant: 'error',
					body: `{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid Authorization header"
}`
				}
			]
		},
		// ── System ─────────────────────────────────────────────────────────────
		{
			id: 'ep-health',
			method: 'GET',
			path: '/api/health',
			shortDescriptionKey: 'docs.endpoint.health.short',
			descriptionKey: 'docs.endpoint.health.desc',
			headers: {
				id: 'health-headers',
				code: '(no authentication required)',
				displayHtml: '(no authentication required)'
			},
			params: [],
			curlExample: {
				id: 'health-curl',
				code: `curl https://api.metacleaner.com/api/health`,
				displayHtml: `curl https://api.metacleaner.com/api/health`
			},
			responses: [
				{
					status: 200,
					labelKey: 'docs.endpoint.health.response.success.label',
					variant: 'success',
					body: `{
  "status": "ok",
  "version": "1.4.2",
  "timestamp": "2024-01-15T10:30:00Z"
}`
				},
				{
					status: 503,
					labelKey: 'docs.endpoint.health.response.error.label',
					variant: 'error',
					body: `{
  "status": "error",
  "message": "Service temporarily unavailable"
}`
				}
			]
		}
	];
}

export function getCodeExamples(): Record<string, CodeExample> {
	return {
		'auth-header': {
			id: 'auth-header',
			code: 'Authorization: Bearer YOUR_API_KEY',
			displayHtml: 'Authorization: Bearer YOUR_API_KEY'
		},
		'auth-curl': {
			id: 'auth-curl',
			code: `curl https://api.metacleaner.com/api/upload \\
  -H "Authorization: Bearer mc_live_abc123xyz..."`,
			displayHtml: `curl https://api.metacleaner.com/api/upload \\
  -H "Authorization: Bearer mc_live_abc123xyz..."`
		},
		'auth-401': {
			id: 'auth-401',
			code: `{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid Authorization header"
}`,
			displayHtml: `{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid Authorization header"
}`
		},
		'auth-403': {
			id: 'auth-403',
			code: `{
  "status": "error",
  "code": "FORBIDDEN",
  "message": "API key does not have permission to access this resource"
}`,
			displayHtml: `{
  "status": "error",
  "code": "FORBIDDEN",
  "message": "API key does not have permission to access this resource"
}`
		},
		'error-standard': {
			id: 'error-standard',
			code: `{
  "status": "error",
  "code": "INVALID_INPUT",
  "message": "The 'file' field is required",
  "details": {
    "field": "file",
    "constraint": "required"
  }
}`,
			displayHtml: `{
  "status": "error",
  "code": "INVALID_INPUT",
  "message": "The 'file' field is required",
  "details": {
    "field": "file",
    "constraint": "required"
  }
}`
		},
		'base-url': {
			id: 'base-url',
			code: 'https://api.metacleaner.com',
			displayHtml: 'https://api.metacleaner.com'
		}
	};
}

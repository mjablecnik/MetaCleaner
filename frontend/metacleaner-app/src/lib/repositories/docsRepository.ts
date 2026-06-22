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
}

export interface DocsConfig {
	apiVersion: string;
	baseUrl: string;
}

export function getDocsConfig(): DocsConfig {
	return {
		apiVersion: 'v1',
		baseUrl: 'https://api.metacleaner.com/v1'
	};
}

export function getSidebarSections(): SidebarSection[] {
	return [
		{ id: 'sec-intro', icon: 'fa-house', labelKey: 'docs.sidebar.intro' },
		{ id: 'sec-auth', icon: 'fa-lock', labelKey: 'docs.sidebar.auth' },
		{ id: 'sec-errors', icon: 'fa-triangle-exclamation', labelKey: 'docs.sidebar.errors' }
	];
}

export function getSidebarEndpoints(): SidebarEndpoint[] {
	return [
		{ id: 'ep-upload', method: 'POST', label: 'Upload' },
		{ id: 'ep-clean', method: 'POST', label: 'Clean' },
		{ id: 'ep-status', method: 'GET', label: 'Status' },
		{ id: 'ep-download', method: 'GET', label: 'Download' },
		{ id: 'ep-metadata', method: 'GET', label: 'Metadata' },
		{ id: 'ep-delete', method: 'DEL', label: 'Delete' }
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
				{ text: ' /files/upload', color: 'text-white' },
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
				{ text: ' /files/clean', color: 'text-white' },
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
				{ text: ' /jobs/{job_id}/status', color: 'text-white' },
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
				{ text: ' /files/{file_id}/download', color: 'text-white' }
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
		{
			id: 'ep-upload',
			method: 'POST',
			path: '/files/upload',
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
				code: `curl -X POST https://api.metacleaner.com/v1/files/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@photo.jpg"`,
				displayHtml: `curl -X POST https://api.metacleaner.com/v1/files/upload \\
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
			path: '/files/clean',
			descriptionKey: 'docs.endpoint.clean.desc',
			headers: {
				id: 'clean-headers',
				code: 'Content-Type: application/json\nAuthorization: Bearer YOUR_API_KEY',
				displayHtml: 'Content-Type: application/json\nAuthorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'file_id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.clean.param.fileId.desc'
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
				code: `curl -X POST https://api.metacleaner.com/v1/files/clean \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"file_id":"f_abc123xyz","options":{"strip_gps":true,"strip_exif":true}}'`,
				displayHtml: `curl -X POST https://api.metacleaner.com/v1/files/clean \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"file_id":"f_abc123xyz","options":{"strip_gps":true,"strip_exif":true}}'`
			},
			responses: [
				{
					status: 202,
					labelKey: 'docs.endpoint.clean.response.success.label',
					variant: 'success',
					body: `{
  "status": "accepted",
  "job_id": "job_def456uvw",
  "file_id": "f_abc123xyz",
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
  "message": "File not found or does not belong to your account"
}`
				}
			]
		},
		{
			id: 'ep-status',
			method: 'GET',
			path: '/jobs/{job_id}/status',
			descriptionKey: 'docs.endpoint.status.desc',
			headers: {
				id: 'status-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [
				{
					name: 'job_id',
					type: 'string',
					required: true,
					descriptionKey: 'docs.endpoint.status.param.jobId.desc'
				}
			],
			statusValues: ['pending', 'processing', 'completed', 'failed'],
			curlExample: {
				id: 'status-curl',
				code: `curl https://api.metacleaner.com/v1/jobs/job_def456uvw/status \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
				displayHtml: `curl https://api.metacleaner.com/v1/jobs/job_def456uvw/status \\
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
  "file_id": "f_abc123xyz",
  "cleaned_file_id": "f_ghi789rst",
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
			id: 'ep-download',
			method: 'GET',
			path: '/files/{file_id}/download',
			descriptionKey: 'docs.endpoint.download.desc',
			isMinimal: true,
			placeholderKey: 'docs.endpoint.download.placeholder',
			headers: {
				id: 'download-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [],
			curlExample: {
				id: 'download-curl',
				code: 'curl https://api.metacleaner.com/v1/files/{file_id}/download \\\n  -H "Authorization: Bearer YOUR_API_KEY"',
				displayHtml: 'curl https://api.metacleaner.com/v1/files/{file_id}/download \\\n  -H "Authorization: Bearer YOUR_API_KEY"'
			},
			responses: []
		},
		{
			id: 'ep-metadata',
			method: 'GET',
			path: '/files/{file_id}/metadata',
			descriptionKey: 'docs.endpoint.metadata.desc',
			isMinimal: true,
			placeholderKey: 'docs.endpoint.metadata.placeholder',
			headers: {
				id: 'metadata-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [],
			curlExample: {
				id: 'metadata-curl',
				code: 'curl https://api.metacleaner.com/v1/files/{file_id}/metadata \\\n  -H "Authorization: Bearer YOUR_API_KEY"',
				displayHtml: 'curl https://api.metacleaner.com/v1/files/{file_id}/metadata \\\n  -H "Authorization: Bearer YOUR_API_KEY"'
			},
			responses: []
		},
		{
			id: 'ep-delete',
			method: 'DEL',
			path: '/files/{file_id}',
			descriptionKey: 'docs.endpoint.delete.desc',
			isMinimal: true,
			placeholderKey: 'docs.endpoint.delete.placeholder',
			headers: {
				id: 'delete-headers',
				code: 'Authorization: Bearer YOUR_API_KEY',
				displayHtml: 'Authorization: Bearer YOUR_API_KEY'
			},
			params: [],
			curlExample: {
				id: 'delete-curl',
				code: 'curl -X DELETE https://api.metacleaner.com/v1/files/{file_id} \\\n  -H "Authorization: Bearer YOUR_API_KEY"',
				displayHtml: 'curl -X DELETE https://api.metacleaner.com/v1/files/{file_id} \\\n  -H "Authorization: Bearer YOUR_API_KEY"'
			},
			responses: []
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
			code: `curl https://api.metacleaner.com/v1/files/upload \\
  -H "Authorization: Bearer mc_live_abc123xyz..."`,
			displayHtml: `curl https://api.metacleaner.com/v1/files/upload \\
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
			code: 'https://api.metacleaner.com/v1',
			displayHtml: 'https://api.metacleaner.com/v1'
		}
	};
}

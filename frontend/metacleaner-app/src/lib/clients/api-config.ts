import { PUBLIC_API_URL } from '$env/static/public';

const API_BASE_URL: string = PUBLIC_API_URL.replace(/\/+$/, '');
if (!API_BASE_URL) {
	console.warn('[MetaCleanerApi] PUBLIC_API_URL is not set — API requests will use relative paths');
}

export function buildApiUrl(path: string): string {
	return `${API_BASE_URL}${path}`;
}

export function buildWsUrl(path: string): string {
	const wsProtocol = API_BASE_URL.startsWith('https://') ? 'wss://' : 'ws://';
	const host = API_BASE_URL.replace(/^https?:\/\//, '');
	return `${wsProtocol}${host}${path}`;
}

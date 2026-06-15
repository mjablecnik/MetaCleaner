import { PUBLIC_API_URL } from '$env/static/public';

const API_BASE_URL: string = PUBLIC_API_URL.replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
	if (!API_BASE_URL) {
		throw new Error(
			'[MetaCleanerApi] PUBLIC_API_URL is not set. ' +
				'Create a .env file with PUBLIC_API_URL=http://localhost:8080'
		);
	}
	return `${API_BASE_URL}${path}`;
}

export function buildWsUrl(path: string): string {
	if (!API_BASE_URL) {
		throw new Error(
			'[MetaCleanerApi] PUBLIC_API_URL is not set. ' +
				'Create a .env file with PUBLIC_API_URL=http://localhost:8080'
		);
	}
	const wsProtocol = API_BASE_URL.startsWith('https://') ? 'wss://' : 'ws://';
	const host = API_BASE_URL.replace(/^https?:\/\//, '');
	return `${wsProtocol}${host}${path}`;
}

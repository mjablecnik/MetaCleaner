import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.metacleaner.app',
	appName: 'MetaCleaner',
	webDir: 'build',
	server: {
		androidScheme: 'https'
	}
};

export default config;

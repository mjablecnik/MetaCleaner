import { defineConfig } from 'playwright/test';

export default defineConfig({
	testDir: './e2e',
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		timeout: 120_000,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:4173',
		headless: true,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' }
		}
	]
});

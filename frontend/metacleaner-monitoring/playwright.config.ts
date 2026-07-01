import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		env: {
			DASHBOARD_SESSION_SECRET: 'e2e-test-secret',
			SUPABASE_URL: 'http://127.0.0.1:9',
			SUPABASE_SERVICE_KEY: 'e2e-test-key'
		}
	},
	testMatch: '**/*.e2e.{ts,js}'
});

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'metacleaner-app': resolve(__dirname, '../../frontend/metacleaner-app'),
    },
  },
  test: {
    environment: 'node',
  },
});

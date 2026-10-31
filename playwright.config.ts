import { defineConfig } from '@playwright/test';

/**
 * E2E tests run against the built site (npm run build first).
 * Port 4321: normal preview (local file delivery). Port 4322: delivery set to "none"
 * to test the honest "not connected" path.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'qa-output/e2e-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'off' },
  webServer: [
    {
      command: 'node ./dist/server/entry.mjs',
      url: 'http://127.0.0.1:4321/',
      reuseExistingServer: true,
      env: { PORT: '4321', HOST: '127.0.0.1', ENQUIRY_DELIVERY: 'file' },
    },
    {
      command: 'node ./dist/server/entry.mjs',
      url: 'http://127.0.0.1:4322/',
      reuseExistingServer: true,
      env: { PORT: '4322', HOST: '127.0.0.1', ENQUIRY_DELIVERY: 'none' },
    },
  ],
});

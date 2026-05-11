import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});

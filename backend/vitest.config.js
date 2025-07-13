import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'coverage/',
        'dist/',
        '**/*.config.js',
        '**/*.config.ts',
      ],
    },
    testTimeout: 10000,
    setupFiles: ['./test/setup.ts'],
  },
  esbuild: {
    target: 'node18',
  },
})

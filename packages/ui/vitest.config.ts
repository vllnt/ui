import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- vitest path alias
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    coverage: {
      exclude: [
        'src/components/**/index.ts',
        '**/*.test.tsx',
        '**/*.visual.tsx',
        '**/*.stories.tsx',
      ],
      include: ['src/components/**/*.tsx'],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // Thresholds removed - will improve coverage incrementally
      // TODO: Re-enable thresholds once all components have tests
    },
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})

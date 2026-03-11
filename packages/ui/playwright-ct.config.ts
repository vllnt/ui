import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices } from '@playwright/experimental-ct-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  testDir: './src/components',
  testMatch: '**/*.visual.tsx',
  snapshotDir: './.snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{projectName}/{arg}{ext}',

  // Retry failed tests once
  retries: 1,

  // Reporter
  reporter: [['html', { open: 'never' }], ['list']],

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  use: {
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
        },
      },
      css: {
        postcss: resolve(__dirname, './postcss.config.mjs'),
      },
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

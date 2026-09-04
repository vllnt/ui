import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices } from '@playwright/experimental-ct-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (process.platform === 'linux') {
  process.env.FONTCONFIG_FILE = resolve(__dirname, './playwright/fonts.conf')
}

export default defineConfig({
  testDir: './src/components',
  testMatch: '**/*.visual.tsx',
  snapshotDir: './.snapshots',
  snapshotPathTemplate: '{snapshotDir}/{platform}/{testFileDir}/{testFileName}-{projectName}/{arg}{ext}',

  // Retry failed tests once
  retries: 1,

  // Reporter
  reporter: [['html', { open: 'never' }], ['list']],

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },

  use: {
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezoneId: 'UTC',
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
          'next/link': resolve(__dirname, './.storybook/next-stubs.ts'),
          'next/navigation': resolve(__dirname, './.storybook/next-stubs.ts'),
          'next-themes': resolve(__dirname, './.storybook/next-themes-stub.ts'),
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

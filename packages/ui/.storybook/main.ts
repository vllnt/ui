import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineMain } from '@storybook/react-vite/node'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineMain({
  stories: ['../src/**/*.stories.@(ts|tsx)'],

  framework: '@storybook/react-vite',

  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-designs',
    '@storybook/addon-mcp',
  ],

  viteFinal(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias ?? {}),
          '@': resolve(__dirname, '../src'),
          'next/link': resolve(__dirname, './next-stubs.ts'),
          'next/image': resolve(__dirname, './next-stubs.ts'),
          'next/navigation': resolve(__dirname, './next-stubs.ts'),
        },
      },
      css: {
        ...config.css,
        postcss: resolve(__dirname, '../postcss.config.mjs'),
      },
    }
  },
})

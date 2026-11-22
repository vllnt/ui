import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineMain } from '@storybook/react-vite/node'
import remarkGfm from 'remark-gfm'

import { rybbitManagerHead } from './rybbit'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineMain({
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],

  framework: '@storybook/react-vite',

  addons: [
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-themes',
    '@storybook/addon-designs',
    '@storybook/addon-mcp',
    '@chromatic-com/storybook',
    '@github-ui/storybook-addon-performance-panel',
  ],

  /**
   * Rybbit analytics, in the manager page only: its URL changes on every story
   * (one pageview each) and the preview iframe would count the same visit twice.
   * The host and site id are read at build time; a build without both ships no tag.
   */
  managerHead: rybbitManagerHead,

  viteFinal(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias ?? {}),
          '@': resolve(__dirname, '../src'),
          'next/link': resolve(__dirname, './next-stubs.ts'),
          'next/image': resolve(__dirname, './next-image-stub.ts'),
          'next/navigation': resolve(__dirname, './next-stubs.ts'),
          'next-themes': resolve(__dirname, './next-themes-stub.ts'),
        },
      },
      css: {
        ...config.css,
        postcss: resolve(__dirname, '../postcss.config.mjs'),
      },
    }
  },
})

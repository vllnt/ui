import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineMain } from '@storybook/react-vite/node'
import remarkGfm from 'remark-gfm'

import { cfBeaconTag } from './cf-beacon'

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

  // The token is read at build time; a build without it ships no beacon.
  managerHead: (head) =>
    `${head ?? ''}${cfBeaconTag(process.env.NEXT_PUBLIC_CF_BEACON_TOKEN)}`,

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

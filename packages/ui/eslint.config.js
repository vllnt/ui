import { react } from '@vllnt/eslint-config'

export default [
  {
    ignores: ['node_modules/**', 'eslint.config.js', 'scripts/**', 'playwright-ct.config.ts', 'playwright/**', 'postcss.config.mjs', 'tailwind.config.ts'],
  },
  ...react,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'simple-import-sort/exports': 'off',
      'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
    },
  },
  {
    files: ['**/components/cookie-consent/cookie-consent.tsx'],
    rules: {
      // Cookie consent component has multiple UI states and animations
      'max-lines-per-function': 'off',
    },
  },
]

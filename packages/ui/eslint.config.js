import { react } from '@vllnt/eslint-config'

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'storybook-static/**', '.storybook/**', 'eslint.config.js', 'scripts/**', 'playwright-ct.config.ts', 'playwright/**', 'postcss.config.mjs', 'tailwind.config.ts', 'tsup.config.ts', 'src/**/*.visual.tsx', 'src/**/*.stories.tsx', 'src/**/*.stories.ts'],
  },
  ...react,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'simple-import-sort/exports': 'off',
      'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
      'jsx-a11y/anchor-ambiguous-text': 'error',
      'jsx-a11y/interactive-supports-focus': [
        'error',
        {
          tabbable: [
            'button',
            'checkbox',
            'link',
            'progressbar',
            'searchbox',
            'slider',
            'spinbutton',
            'switch',
            'textbox',
          ],
        },
      ],
      'jsx-a11y/lang': 'error',
      'jsx-a11y/no-aria-hidden-on-focusable': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': [
        'error',
        {
          body: ['onError', 'onLoad'],
          iframe: ['onError', 'onLoad'],
          img: ['onError', 'onLoad'],
        },
      ],
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
    },
  },
  {
    files: ['**/components/cookie-consent/cookie-consent.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/slideshow/slideshow.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/carousel/carousel.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/code-block/code-block.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/code-playground/code-playground.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/comparison/comparison.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/flow-diagram/flow-diagram.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/navbar-saas/navbar-saas.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/terminal/terminal.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/data-table/data-table.tsx'],
    rules: {
      'max-lines-per-function': 'off',
      'react-hooks/incompatible-library': 'off',
      'react/no-unstable-nested-components': 'off',
    },
  },
  {
    files: ['**/components/search-bar/search-bar.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/search-dialog/search-dialog.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/tldr-section/tldr-section.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/progress-card/progress-card.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/components/theme-toggle/theme-toggle.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/use-*.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
]

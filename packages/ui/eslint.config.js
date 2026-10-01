import { react } from '@vllnt/eslint-config'

export default [
  {
    // Build-tool configs outside the typed component surface are not linted
    // (postcss.config.mjs, tailwind.config.ts, tsup/playwright configs).
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
          // Passive focus tracking: an <article> observes focus bubbling from
          // its interactive children (e.g. ChronoEvent scroll-spy).
          article: ['onFocus'],
          body: ['onError', 'onLoad'],
          iframe: ['onError', 'onLoad'],
          img: ['onError', 'onLoad'],
        },
      ],
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      // cmdk styles its input wrapper via the `[cmdk-input-wrapper]` attribute selector.
      'react/no-unknown-property': ['error', { ignore: ['cmdk-input-wrapper'] }],
    },
  },
  {
    // vaul's Drawer `autoFocus` prop moves focus into the opened sheet (APG
    // modal dialog); the rule targets DOM autofocus on page load.
    files: ['**/drawer/drawer.tsx'],
    rules: {
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
    },
  },
  {
    // Scrolling regions and logs must be reachable by keyboard (WCAG 2.1.1,
    // axe scrollable-region-focusable). A labelled <section> is a region, and
    // no-redundant-roles forbids spelling role="region" on it.
    files: [
      '**/ai-artifact/ai-artifact.tsx',
      '**/bottom-activity-strip/bottom-activity-strip.tsx',
      '**/canvas-view/canvas-view.tsx',
      '**/conversation-thread/conversation-thread.tsx',
      '**/gantt-chart/gantt-chart.tsx',
      '**/parallel-timeline/parallel-timeline.tsx',
    ],
    rules: {
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { roles: ['log', 'region'], tags: ['section'] },
      ],
    },
  },
  {
    // APG tabs: a tab panel without focusable content is itself a tab stop.
    files: ['**/tabs/tabs.tsx'],
    rules: {
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel'], tags: [] }],
    },
  },
  {
    // CanvasView's focusable workspace <section> pans and zooms with keys only
    // when it is the event target itself (RULES.md R12).
    files: ['**/canvas-view/canvas-view.tsx'],
    rules: {
      'jsx-a11y/no-noninteractive-element-interactions': [
        'error',
        {
          body: ['onError', 'onLoad'],
          iframe: ['onError', 'onLoad'],
          img: ['onError', 'onLoad'],
          section: ['onBlur', 'onKeyDown', 'onKeyUp'],
        },
      ],
    },
  },
  {
    // Tailwind theme keys (`DEFAULT`, `2xl`, `accordion-down`, `0%`) and the
    // Vite `@` path alias are dictated by the tools, not by our naming style.
    files: ['src/tailwind-preset.ts', 'vitest.config.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  {
    files: ['**/cookie-consent/cookie-consent.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test-setup.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'unicorn/no-null': 'off',
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/slideshow/slideshow.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/carousel/carousel.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/code-block/code-block.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/code-playground/code-playground.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/comparison/comparison.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/flow-diagram/flow-diagram.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/navbar-saas/navbar-saas.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/terminal/terminal.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/data-table/data-table.tsx'],
    rules: {
      'max-lines-per-function': 'off',
      'react-hooks/incompatible-library': 'off',
      'react/no-unstable-nested-components': 'off',
    },
  },
  {
    files: ['**/search-bar/search-bar.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/search-dialog/search-dialog.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/tldr-section/tldr-section.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/progress-card/progress-card.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/theme-toggle/theme-toggle.tsx'],
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

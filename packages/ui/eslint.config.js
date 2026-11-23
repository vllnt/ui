import { react } from '@vllnt/eslint-config'

import a12Allowlist from './eslint-rules/a12-allowlist.js'
import a12StatusTextColour from './eslint-rules/a12-status-text-colour.js'

export default [
  {
    // Build-tool configs outside the typed component surface are not linted
    // (postcss.config.mjs, tailwind.config.ts, tsup/playwright configs).
    ignores: ['node_modules/**', 'dist/**', 'storybook-static/**', '.storybook/**', 'eslint.config.js', 'eslint-rules/**', 'scripts/**', 'playwright-ct.config.ts', 'playwright/**', 'postcss.config.mjs', 'tailwind.config.ts', 'tsup.config.ts', 'src/**/*.visual.tsx', 'src/**/*.stories.tsx', 'src/**/*.stories.ts'],
  },
  ...react,
  {
    // `__tests__` holds shared test helpers; tsup and check:atomic key on that
    // exact name, so the folder keeps it.
    files: ['src/**/__tests__/**'],
    rules: { 'unicorn/filename-case': 'off' },
  },
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
    // A12 (signature v1.3): status colour goes on a glyph, a dot or a border,
    // never on words. See eslint-rules/a12-status-text-colour.js.
    files: ['src/components/**/*.tsx'],
    ignores: ['**/*.test.tsx', '**/*.visual.tsx'],
    plugins: { vllnt: { rules: { 'a12-no-status-text-colour': a12StatusTextColour } } },
    rules: { 'vllnt/a12-no-status-text-colour': 'error' },
  },
  // Files that predate A12 (list only shrinks); flat config rejects an empty `files`.
  ...(a12Allowlist.length > 0
    ? [{ files: a12Allowlist, rules: { 'vllnt/a12-no-status-text-colour': 'off' } }]
    : []),
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
      '**/code-block/code-block.tsx',
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
    // The deprecated JarvisDock aliases stay exported for one release
    // (vllnt/ui#682), so the barrel and the alias test have to name them.
    files: ['src/components/index.ts', '**/command-dock/command-dock.test.tsx'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
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

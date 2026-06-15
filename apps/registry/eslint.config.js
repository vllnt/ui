import { nextjs } from '@vllnt/eslint-config'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'registry/**',
      'public/**',
      '*.config.*',
      'eslint.config.js',
      'next-env.d.ts',
      'scripts/**',
      'e2e/**',
    ],
  },
  ...nextjs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    rules: {
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
    /* Externally-mandated key shapes: JSON-LD (@context/@type), web app
       manifest (snake_case members), MCP JSON-RPC protocol fields. */
    files: ['lib/jsonld.ts', 'lib/seo.ts', 'app/manifest.ts', 'app/mcp/route.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  {
    /* MCP route speaks JSON-RPC: null is part of the wire protocol, the
       error factory mirrors the JSON-RPC error signature, and the switch
       based dispatchers read better unsplit. */
    files: ['app/mcp/route.ts'],
    rules: {
      'unicorn/no-null': 'off',
      'max-params': 'off',
    },
  },
  {
    /* "docs" is the literal name of the /docs site section, not an
       abbreviation. Options replicate the preset (rule options replace,
       not merge). */
    rules: {
      'unicorn/prevent-abbreviations': [
        'error',
        {
          extendDefaultReplacements: true,
          replacements: {
            ctx: false,
            db: false,
            docs: false,
            e: false,
            fn: false,
            props: false,
            ref: false,
            utils: false,
          },
          ignore: [
            'e2e',
            'a11y',
            'i18n',
            'getInitialProps',
            'generateStaticParams',
            'dynamicParams',
            '.*Ctx$',
            '.*Ref$',
          ],
        },
      ],
    },
  },
  {
    files: [
      'app/mcp/route.ts',
      'app/r/themes/route.ts',
      'components/header/header.tsx',
      'components/theme-editor/theme-editor.tsx',
      'lib/og.ts',
      'lib/sidebar-sections.ts',
      'lib/theme-serialize.ts',
    ],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
]

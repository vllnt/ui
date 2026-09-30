import { nextjs } from '@vllnt/eslint-config'

const NAMING_CONVENTION = '@typescript-eslint/naming-convention'

/* The preset's project-wide naming-convention options. Rule options replace
   rather than merge, so the scoped overrides below extend this list. */
const [, ...namingConventionOptions] = nextjs.find(
  (config) => !config.files && config.rules?.[NAMING_CONVENTION],
).rules[NAMING_CONVENTION]

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
    /* Next.js route handlers must export UPPER_CASE HTTP-method functions. */
    files: ['app/**/route.ts'],
    ignores: ['app/api/**'], // the preset already turns the rule off there
    rules: {
      [NAMING_CONVENTION]: [
        'error',
        {
          selector: 'function',
          modifiers: ['exported'],
          filter: { regex: '^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS)$', match: true },
          format: ['UPPER_CASE'],
        },
        ...namingConventionOptions,
      ],
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
    /* next-intl's createNavigation returns the `Link` component, destructured
       under its PascalCase component name. */
    files: ['i18n/routing.ts'],
    rules: {
      [NAMING_CONVENTION]: [
        'error',
        {
          selector: 'variable',
          modifiers: ['destructured'],
          format: ['camelCase', 'PascalCase'],
        },
        ...namingConventionOptions,
      ],
    },
  },
  {
    /* Data keyed by external names (npm packages, sandbox paths, CSS custom
       properties) that cannot be camelCase; only keys needing quotes are exempt. */
    files: ['lib/codesandbox.ts', 'lib/theme-tokens.ts'],
    rules: {
      [NAMING_CONVENTION]: [
        'error',
        {
          selector: 'objectLiteralProperty',
          modifiers: ['requiresQuotes'],
          format: null,
        },
        ...namingConventionOptions,
      ],
    },
  },
  {
    /* The badge preview renders the /api/badge SVG with the same plain <img>
       the copied snippets embed; next/image would change that markup. */
    files: ['components/badge-snippets/badge-snippets.tsx'],
    rules: {
      '@next/next/no-img-element': 'off',
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

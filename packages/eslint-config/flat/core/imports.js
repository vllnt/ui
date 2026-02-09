import simpleImportSort from 'eslint-plugin-simple-import-sort'

export const imports = {
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    // Disable rules set later on in another way
    'sort-imports': 'off',

    // Require explicit type import in a top-level style
    // It helps TS compiler drop unused imports without side effects.
    // Note: no-duplicate-imports is disabled because it conflicts with separate type imports
    'no-duplicate-imports': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],

    // Fine-tuned import sorting
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'], // Side effect (E.g."import "normalize.css"")
          ['^react$', '^node:'], // Built-in
          ['^[^.]'], // External packages
          ['^@vllnt/'], // Workspace packages
          ['^@/'], // Absolute path imports
          ['^../'], // Parent imports
          ['^./'], // Sibling imports
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
  },
}

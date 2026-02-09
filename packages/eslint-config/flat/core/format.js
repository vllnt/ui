import prettierPlugin from 'eslint-plugin-prettier'
import perfectionistPlugin from 'eslint-plugin-perfectionist'

export const format = {
  plugins: {
    prettier: prettierPlugin,
    perfectionist: perfectionistPlugin,
  },
  rules: {
    'prettier/prettier': 'error',

    /**
     * Perfectionist basically sorts everything alphabetically, excepted for:
     * - ES6 Class properties/methods sorting not enable, too noisy
     * - Import sorting is handled by `simple-import-sort` plugin
     */
    'perfectionist/sort-array-includes': ['error', { type: 'natural' }],
    'perfectionist/sort-enums': ['error', { type: 'natural' }],
    'perfectionist/sort-interfaces': ['error', { type: 'natural' }],
    'perfectionist/sort-jsx-props': ['error', { type: 'natural' }],
    'perfectionist/sort-maps': ['error', { type: 'natural' }],
    'perfectionist/sort-named-exports': ['error', { type: 'natural' }],
    'perfectionist/sort-object-types': ['error', { type: 'natural' }],
    'perfectionist/sort-objects': ['error', { type: 'natural' }],
    'perfectionist/sort-union-types': ['error', { type: 'natural' }],
  },
}

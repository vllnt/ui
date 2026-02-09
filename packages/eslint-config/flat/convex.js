import convexPlugin from '@convex-dev/eslint-plugin'

export const convex = [
  {
    plugins: {
      '@convex-dev': convexPlugin,
    },
  },
  {
    files: ['**/convex/**/*.ts'],
    rules: {
      '@convex-dev/import-wrong-runtime': 'off',
      '@convex-dev/no-old-registered-function-syntax': 'error',
      '@convex-dev/require-args-validator': 'error',
      'unicorn/filename-case': ['error', { cases: { snakeCase: true } }],
    },
  },
]

export default convex

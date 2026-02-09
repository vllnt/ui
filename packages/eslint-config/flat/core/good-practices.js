import functionalPlugin from 'eslint-plugin-functional'
import writeGoodCommentsPlugin from 'eslint-plugin-write-good-comments'

export const goodPractices = {
  plugins: {
    functional: functionalPlugin,
    'write-good-comments': writeGoodCommentsPlugin,
  },
  rules: {
    'no-unreachable-loop': 'error',
    'prefer-const': 'error',
    'no-async-promise-executor': 'error',
    'no-console': ['error', { allow: ['debug', 'error', 'info', 'warn'] }],

    // Write better concise english comments
    'write-good-comments/write-good-comments': 'error',

    // Limit function arguments count to 3
    'max-params': ['error', 3],

    // Limit function body length to 30 lines
    'max-lines-per-function': [
      'error',
      {
        max: 30,
        skipBlankLines: true,
        skipComments: true,
      },
    ],

    // Don't re-assign function parameters
    'no-param-reassign': 'error',

    // Avoid deep nesting (if statements, loops, etc.)
    'max-depth': ['error', 3],

    /**
     * Functional programming rules - encourage immutability
     */
    'functional/no-loop-statements': 'error',
    'functional/functional-parameters': [
      'error',
      {
        allowRestParameter: true,
        allowArgumentsKeyword: false,
        enforceParameterCount: false,
      },
    ],
    'functional/readonly-type': ['error', 'keyword'],
  },
}

export const goodPracticesTsx = {
  files: ['**/*.tsx'],
  rules: {
    // Allow up to 70 lines for React components (JSX markup adds lines)
    'max-lines-per-function': [
      'error',
      {
        max: 70,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
  },
}

export const goodPracticesTest = {
  files: ['**/*.test.ts', '**/*.spec.ts', '**/*.e2e.ts'],
  rules: {
    // Disable max-lines-per-function for tests (for `describe` blocks)
    'max-lines-per-function': 'off',
  },
}

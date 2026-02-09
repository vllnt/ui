import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import turboPlugin from 'eslint-plugin-turbo'
import nextPlugin from '@next/eslint-plugin-next'
import { goodPractices, goodPracticesTsx, goodPracticesTest } from './core/good-practices.js'
import { imports } from './core/imports.js'
import { format } from './core/format.js'
import { unicornConfig, unicornTsx, unicornFilename } from './core/unicorn.js'
import {
  typescriptConfig,
  typescriptTsx,
  typescriptTest,
  typescriptDecorator,
} from './core/typescript.js'
import { reactConfig } from './core/react.js'
import { boundariesConfig } from './core/boundaries.js'

export const nextjs = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      ...turboPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  goodPractices,
  goodPracticesTsx,
  goodPracticesTest,
  imports,
  format,
  unicornConfig,
  unicornTsx,
  unicornFilename,
  typescriptConfig,
  typescriptTsx,
  typescriptTest,
  typescriptDecorator,
  reactConfig,
  boundariesConfig,
  {
    files: ['**/app/**/page.{js,jsx,ts,tsx}', '**/app/**/layout.{js,jsx,ts,tsx}'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/app/api/**/route.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'ExportNamedDeclaration > FunctionDeclaration:not([id.name=/^(GET|POST|PUT|DELETE)$/])',
          message: 'Only GET, POST, PUT, DELETE are allowed as exported route handlers in route.ts',
        },
        {
          selector:
            'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[init.type=/^(ArrowFunctionExpression|FunctionExpression)$/]:not([id.name=/^(GET|POST|PUT|DELETE|DELET)$/])',
          message: 'Only GET, POST, PUT, DELETE are allowed as exported route handlers in route.ts',
        },
      ],
    },
  },
)

export default nextjs

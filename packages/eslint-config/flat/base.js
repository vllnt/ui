import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import turboPlugin from 'eslint-plugin-turbo'
import { goodPractices } from './core/good-practices.js'
import { imports } from './core/imports.js'
import { format } from './core/format.js'
import { unicornConfig } from './core/unicorn.js'
import { typescriptConfig } from './core/typescript.js'

export const base = [
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      ...turboPlugin.configs.recommended.rules,
    },
  },
  goodPractices,
  imports,
  format,
  unicornConfig,
  typescriptConfig,
]


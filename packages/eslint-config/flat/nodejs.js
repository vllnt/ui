import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import turboPlugin from 'eslint-plugin-turbo'
import { goodPractices, goodPracticesTest } from './core/good-practices.js'
import { imports } from './core/imports.js'
import { format } from './core/format.js'
import { unicornConfig, unicornFilename } from './core/unicorn.js'
import { typescriptConfig, typescriptTest, typescriptDecorator } from './core/typescript.js'

export const nodejs = tseslint.config(
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
    },
    rules: {
      ...turboPlugin.configs.recommended.rules,
    },
  },
  goodPractices,
  goodPracticesTest,
  imports,
  format,
  unicornConfig,
  unicornFilename,
  typescriptConfig,
  typescriptTest,
  typescriptDecorator,
)

export default nodejs


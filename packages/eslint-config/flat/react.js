import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import turboPlugin from 'eslint-plugin-turbo'
import { goodPractices, goodPracticesTsx, goodPracticesTest } from './core/good-practices.js'
import { imports } from './core/imports.js'
import { format } from './core/format.js'
import { unicornConfig, unicornTsx, unicornFilename } from './core/unicorn.js'
import { typescriptConfig, typescriptTsx, typescriptTest, typescriptDecorator } from './core/typescript.js'
import { reactConfig } from './core/react.js'

export const react = tseslint.config(
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
)

export default react


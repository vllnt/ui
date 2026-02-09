import { nextjs } from '@vllnt/eslint'

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
    ],
  },
  ...nextjs,
]

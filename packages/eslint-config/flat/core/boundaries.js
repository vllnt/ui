import boundariesPlugin from 'eslint-plugin-boundaries'

export const boundariesConfig = {
  plugins: {
    boundaries: boundariesPlugin,
  },
  settings: {
    'boundaries/include': ['src/**/*.ts*'],
    'boundaries/elements': [
      { type: 'configuration', pattern: 'src/configuration/**' },
      { type: 'contexts', pattern: 'src/contexts/**' },
      { type: 'core', pattern: 'src/core/**' },
      { type: 'fonts', pattern: 'src/fonts/**' },
      { type: 'libs', pattern: 'src/libs/**' },
      { type: 'pages', pattern: 'src/pages/**' },
      { type: 'types', pattern: 'src/types/**' },
      { type: 'utils', pattern: 'src/utils/**' },
      { type: 'component:atoms', pattern: 'src/components/atoms/**' },
      { type: 'component:common', pattern: 'src/components/common/**' },
      { type: 'component:molecules', pattern: 'src/components/molecules/**' },
      { type: 'component:organisms', pattern: 'src/components/organisms/**' },
      { type: 'component:pages', pattern: 'src/components/pages/**' },
      { type: 'component:templates', pattern: 'src/components/templates/**' },
    ],
  },
  rules: {
    ...boundariesPlugin.configs.recommended.rules,
    'boundaries/element-types': [
      'error',
      {
        default: 'allow',
        message: '${file.type} is not allowed to import ${dependency.type}',
        rules: [
          {
            from: 'core',
            disallow: ['libs'],
            message: '@/core is not allowed to import from @/libs',
          },
          {
            from: 'libs',
            disallow: ['libs'],
            message: '@/libs cannot import from other @/libs modules',
          },
          {
            from: [
              'component:atoms',
              'component:molecules',
              'component:organisms',
            ],
            disallow: ['libs', 'core'],
            message: '@/components cannot import from @/libs or @/core',
          },
          {
            from: 'component:atoms',
            disallow: [
              'component:atoms',
              'component:molecules',
              'component:organisms',
              'component:pages',
              'component:templates',
            ],
          },
          {
            from: 'component:molecules',
            disallow: [
              'component:molecules',
              'component:organisms',
              'component:pages',
            ],
          },
          {
            from: 'component:organisms',
            disallow: ['component:organisms', 'component:pages'],
          },
          {
            from: 'component:templates',
            disallow: ['component:pages', 'component:templates'],
          },
          {
            from: 'component:pages',
            disallow: ['component:pages'],
          },
        ],
      },
    ],
  },
}

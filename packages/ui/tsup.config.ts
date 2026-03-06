import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      'src/tailwind-preset.ts',
      'src/**/*.{ts,tsx}',
      '!src/**/*.test.*',
      '!src/**/*.visual.*',
      '!src/**/__tests__/**',
    ],
    format: ['esm'],
    dts: { entry: ['src/index.ts', 'src/tailwind-preset.ts'] },
    bundle: false,
    outDir: 'dist',
    clean: true,
    target: 'es2020',
    tsconfig: 'tsconfig.build.json',
  },
])

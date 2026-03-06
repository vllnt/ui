import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig } from 'tsup'

const prependUseClient = async (): Promise<void> => {
  const distDir = join(import.meta.dirname, 'dist')
  const files = await readdir(distDir)
  const jsFiles = files.filter(
    (f) => f.endsWith('.js') && f !== 'tailwind-preset.js' && f !== 'index.js',
  )
  await Promise.all(
    jsFiles.map(async (file) => {
      const filePath = join(distDir, file)
      const content = await readFile(filePath, 'utf-8')
      if (!content.startsWith('"use client"')) {
        await writeFile(filePath, `"use client";\n${content}`)
      }
    }),
  )
}

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: true,
    treeshake: true,
    clean: true,
    outDir: 'dist',
    onSuccess: prependUseClient,
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'next',
      'next/navigation',
      'next/link',
      'next/image',
      'next-themes',
      /^@radix-ui\//,
      /^@tanstack\//,
      /^@xyflow\//,
      /^@mdx-js\//,
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'cmdk',
      'embla-carousel-react',
      'html-to-image',
      'input-otp',
      'lucide-react',
      'react-day-picker',
      'react-markdown',
      'react-resizable-panels',
      'react-syntax-highlighter',
      'sonner',
      'vaul',
    ],
    target: 'es2020',
    tsconfig: 'tsconfig.build.json',
  },
  {
    entry: ['src/tailwind-preset.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    treeshake: true,
    clean: false,
    outDir: 'dist',
    external: [
      'tailwindcss',
      'tailwindcss-animate',
    ],
    target: 'es2020',
    tsconfig: 'tsconfig.build.json',
  },
])

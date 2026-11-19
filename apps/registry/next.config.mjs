import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Thumbnail iframes use the alternate loopback host for cross-origin isolation.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  output: 'standalone',
  // Emit browser source maps in production so Lighthouse "valid-source-maps" passes
  productionBrowserSourceMaps: true,
  // Allow .mdx extensions for files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Ensure the workspace UI package is transpiled and tree-shaken correctly
  transpilePackages: ['@vllnt/ui'],
  experimental: {
    // With a `[locale]` root segment the router guesses that `/docs/components` is locale "docs" and requests
    // a page that does not exist; the 404 is retried without end, so a visible link keeps the page fetching.
    optimisticRouting: false,
  },
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

// Combine next-intl, MDX, and Next.js config
export default withNextIntl(withMDX(nextConfig))


import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Thumbnail iframes use the alternate loopback host for cross-origin isolation.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // The commit being built (a Coolify build arg). When the server runs a newer
  // deploy than the page, client navigations become full page loads instead of
  // asking for chunks this build does not have.
  deploymentId: process.env.SOURCE_COMMIT || undefined,
  output: 'standalone',
  // Emit browser source maps in production so Lighthouse "valid-source-maps" passes
  productionBrowserSourceMaps: true,
  // Allow .mdx extensions for files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Ensure the workspace UI package is transpiled and tree-shaken correctly
  transpilePackages: ['@vllnt/ui'],
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


/** Cloudflare Web Analytics for the deployed Storybook: cookieless page views only. */
const SITE_TOKEN = /^[a-f0-9]{32}$/i

/**
 * The beacon tag for the Storybook manager head, or an empty string when the
 * build has no valid site token, so local, preview and fork builds load nothing.
 */
export function cfBeaconTag(value: string | undefined): string {
  const token = value?.trim()
  if (!token || !SITE_TOKEN.test(token)) return ''

  return `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${token}"}'></script>`
}

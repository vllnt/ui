/** Cloudflare Web Analytics: cookieless page views, loaded on the production site. */
export const CF_BEACON_SRC =
  "https://static.cloudflareinsights.com/beacon.min.js";

/** A Cloudflare site token is 32 hex characters; the check rejects anything else. */
const SITE_TOKEN = /^[\da-f]{32}$/i;

/**
 * The beacon's site token from the build environment, or `undefined` when it
 * is unset or malformed. Dev, preview and fork builds leave it unset, so they
 * load no beacon and send no data.
 */
export function cloudflareBeaconToken(
  // react-doctor-disable-next-line react-doctor/public-env-secret-name -- the Cloudflare Web Analytics site token is a public identifier: the beacon snippet ships it in every page's HTML by design, and the deploy environment owns the variable name
  value: string | undefined = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN,
): string | undefined {
  const token = value?.trim();

  return token && SITE_TOKEN.test(token) ? token : undefined;
}

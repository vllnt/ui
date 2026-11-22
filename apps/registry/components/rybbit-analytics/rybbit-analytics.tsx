import type { ReactElement } from "react";

/** The path of the tracking script on a Rybbit host. */
const SCRIPT_PATH = "/api/script.js";

/**
 * Reads the origin of a Rybbit host. The script derives its API address from
 * its own `src`, so the host must be one HTTPS address with no proxy path: the
 * origin keeps no path, query or credentials of the value.
 *
 * @param value - The host as configured, such as `https://analytics.example/`.
 * @returns The origin, or `undefined` when the value is not an HTTPS address.
 */
function hostOrigin(value: string | undefined): string | undefined {
  const text = value?.trim();
  if (!text || !URL.canParse(text)) return undefined;
  const url = new URL(text);

  return url.protocol === "https:" ? url.origin : undefined;
}

/**
 * The Rybbit analytics script: one plain `<script defer>` tag in the server
 * HTML, never a `next/script`. `afterInteractive` adds its element in the
 * browser after hydration, so a prerendered page would hold no tag. The layout
 * already ships its inline scripts as plain tags the same way.
 *
 * Next inlines `NEXT_PUBLIC_RYBBIT_HOST` and `NEXT_PUBLIC_RYBBIT_SITE_ID` at
 * build time. A build without either one, such as a preview or a local build,
 * renders nothing. The tag carries the site id and nothing else: no identify
 * call, no event, no tracking switch.
 *
 * Adapted from `RybbitAnalytics` in vllnt/vllnt (#428).
 *
 * @returns The script, or `undefined` when the build has no host or no site id.
 * @example
 * <body>
 *   {children}
 *   <RybbitAnalytics />
 * </body>
 */
export function RybbitAnalytics(): ReactElement | undefined {
  const origin = hostOrigin(process.env.NEXT_PUBLIC_RYBBIT_HOST);
  const siteId = process.env.NEXT_PUBLIC_RYBBIT_SITE_ID?.trim();
  if (!origin || !siteId) return undefined;

  return <script data-site-id={siteId} defer src={`${origin}${SCRIPT_PATH}`} />;
}

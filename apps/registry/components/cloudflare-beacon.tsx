import { CF_BEACON_SRC, cloudflareBeaconToken } from "@/lib/cloudflare-beacon";

/**
 * Cloudflare Web Analytics. The zone's auto-install is off, so this tag is the
 * site's one beacon: Cloudflare's own snippet, a plain deferred script. The
 * server HTML carries one tag, and the build sets the token, so every
 * request gets the same cacheable page. The beacon sets no cookies.
 *
 * @param token - the site token; defaults to `NEXT_PUBLIC_CF_BEACON_TOKEN`
 */
export function CloudflareBeacon({
  token = cloudflareBeaconToken(),
}: {
  token?: string;
}) {
  if (!token) return null;

  return (
    <script
      data-cf-beacon={JSON.stringify({ token })}
      defer
      src={CF_BEACON_SRC}
    />
  );
}

/** The path of the tracking script on a Rybbit host. */
const SCRIPT_PATH = '/api/script.js'

/**
 * Reads the origin of a Rybbit host. The script derives its API address from
 * its own `src`, so the host must be one HTTPS address with no proxy path.
 *
 * @param value - The host as configured, such as `https://analytics.example/`.
 * @returns The origin, or `undefined` when the value is not an HTTPS address.
 */
function hostOrigin(value: string | undefined): string | undefined {
  const text = value?.trim()
  if (!text || !URL.canParse(text)) return undefined
  const url = new URL(text)
  return url.protocol === 'https:' ? url.origin : undefined
}

/**
 * Escapes a value for a double-quoted HTML attribute, so a build variable can
 * never close the tag or add markup to the manager page.
 *
 * @param value - The raw attribute value.
 * @returns The value with `&`, `"`, `<` and `>` escaped.
 */
function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/**
 * The Rybbit analytics tag for the Storybook manager head, or an empty string
 * when the build has no host or no site id, so local, preview and fork builds
 * load nothing. The tag carries the site id and nothing else: no identify
 * call, no event. The registry site renders the same tag from
 * `apps/registry/components/rybbit-analytics`; keep the two in step.
 *
 * @param host - `NEXT_PUBLIC_RYBBIT_HOST`, an HTTPS origin.
 * @param siteId - `NEXT_PUBLIC_RYBBIT_SITE_ID`.
 * @returns One `<script defer>` tag, or an empty string.
 * @example
 * rybbitTag('https://analytics.example', 'abc') // '<script defer data-site-id="abc" src="https://analytics.example/api/script.js"></script>'
 */
export function rybbitTag(
  host: string | undefined,
  siteId: string | undefined,
): string {
  const origin = hostOrigin(host)
  const id = siteId?.trim()
  if (!origin || !id) return ''

  return `<script defer data-site-id="${escapeAttribute(id)}" src="${escapeAttribute(`${origin}${SCRIPT_PATH}`)}"></script>`
}

/**
 * The `managerHead` of the Storybook config: the default head plus the Rybbit
 * tag. Storybook does not expose `NEXT_PUBLIC_*` variables, so this reads them
 * from `process.env` while the build runs.
 *
 * @param head - The manager head Storybook built so far.
 * @returns The head, with the Rybbit tag appended when both variables are set.
 */
export function rybbitManagerHead(head?: string): string {
  return `${head ?? ''}${rybbitTag(process.env.NEXT_PUBLIC_RYBBIT_HOST, process.env.NEXT_PUBLIC_RYBBIT_SITE_ID)}`
}

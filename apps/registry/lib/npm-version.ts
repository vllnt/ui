import { z } from "zod";

import packageJson from "../../../packages/ui/package.json";

const PACKAGE = packageJson as { readonly version: string };

const NPM_DIST_TAGS_URL =
  "https://registry.npmjs.org/-/package/@vllnt%2Fui/dist-tags";
const NPM_HEADERS = new Headers([["Accept", "application/json"]]);

const distributionTagsSchema = z.object({
  canary: z.string().optional(),
  latest: z.string(),
});

/**
 * Resolved npm dist-tags for `@vllnt/ui`.
 *
 * `latest` is the most recent tagged/published release (the npm `latest` tag);
 * `canary` is the auto-published-from-`main` build, when one exists.
 */
export type NpmDistributionTags = {
  readonly canary?: string;
  readonly latest: string;
};

async function fetchDistributionTags(): Promise<NpmDistributionTags> {
  const response = await fetch(NPM_DIST_TAGS_URL, {
    headers: NPM_HEADERS,
    next: { revalidate: 3600 },
  });
  if (!response.ok) return { latest: PACKAGE.version };

  const parsed = distributionTagsSchema.safeParse(await response.json());
  if (!parsed.success) return { latest: PACKAGE.version };
  return { canary: parsed.data.canary, latest: parsed.data.latest };
}

/**
 * Read `@vllnt/ui` npm dist-tags so the site can show the real published
 * `latest` (not the in-repo, possibly-ahead package.json version) and the
 * current `canary` channel. ISR-cached for one hour; degrades to the local
 * package.json version (no canary) on any network or parse failure.
 *
 * @returns The `latest` and optional `canary` versions.
 */
export async function getNpmDistributionTags(): Promise<NpmDistributionTags> {
  return fetchDistributionTags().catch(() => ({ latest: PACKAGE.version }));
}

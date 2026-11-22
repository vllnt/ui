// Checks the Rybbit analytics tag in a page's HTML.
//   node scripts/check-rybbit-tag.mjs <url-or-file> --site-id <id>   exactly one tag, this site id, the edge host
//   node scripts/check-rybbit-tag.mjs <url-or-file> --none           no Rybbit tag at all (test and preview builds)
// Used by .github/workflows/production-analytics.yml (live sites) and storybook.yml (CI build).
// The tags come from apps/registry/components/rybbit-analytics and packages/ui/.storybook/rybbit.ts.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** The production Rybbit host. */
export const RYBBIT_HOST = "https://edge.vllnt.com";
const SCRIPT_PATH = "/api/script.js";

const attribute = (tag, name) => {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
};

/**
 * Every `<script>` opening tag whose `src` ends with the Rybbit script path. Only real tags count:
 * Next also serialises the element into inline flight data as JSON, which never starts with `<script`.
 */
export function rybbitTags(html) {
  return [...html.matchAll(/<script\b[^>]*>/gi)]
    .map(([tag]) => ({ siteId: attribute(tag, "data-site-id"), src: attribute(tag, "src"), tag }))
    .filter(({ src }) => src !== undefined && src.split(/[?#]/)[0].endsWith(SCRIPT_PATH));
}

/** Problems with the page's Rybbit tags; empty when the page is right. `siteId` undefined = expect none. */
export function rybbitProblems(html, siteId) {
  const tags = rybbitTags(html);
  if (siteId === undefined) return tags.map(({ tag }) => `unexpected Rybbit tag: ${tag}`);
  if (tags.length !== 1) return [`expected exactly one Rybbit tag, found ${tags.length}`, ...tags.map(({ tag }) => tag)];
  const [{ siteId: found, src, tag }] = tags;
  const problems = [];
  if (src !== `${RYBBIT_HOST}${SCRIPT_PATH}`) problems.push(`src is ${src}, expected ${RYBBIT_HOST}${SCRIPT_PATH}`);
  if (found !== siteId) problems.push(`data-site-id is ${found ?? "missing"}, expected ${siteId}`);
  if (!/\sdefer[\s=>/]/i.test(tag)) problems.push("the tag has no defer");
  return problems;
}

async function readHtml(source) {
  if (!/^https?:\/\//.test(source)) return readFileSync(source, "utf8");
  // A browser user agent and accept header: the edge challenges bare clients.
  const response = await fetch(source, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    },
  });
  if (!response.ok) throw new Error(`${source} answered ${response.status}`);
  return response.text();
}

export async function main(args) {
  const [source, flag, value] = args;
  const usage = "usage: check-rybbit-tag.mjs <url-or-file> (--site-id <id> | --none)";
  if (!source || !((flag === "--site-id" && value) || (flag === "--none" && value === undefined))) {
    console.error(usage);
    return 2;
  }
  const problems = rybbitProblems(await readHtml(source), flag === "--none" ? undefined : value);
  for (const problem of problems) console.error(`::error::${source}: ${problem}`);
  if (problems.length === 0) console.log(`ok ${source}: ${flag === "--none" ? "no Rybbit tag" : `one Rybbit tag, site id ${value}`}`);
  return problems.length === 0 ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}

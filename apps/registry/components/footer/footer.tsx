import { SiteFooter, type SiteFooterColumn } from "@vllnt/ui";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { localizePathname } from "@/lib/seo";
import { networkFooterColumns } from "@/lib/site-network";

const GITHUB_URL = "https://github.com/vllnt/ui";
const STORYBOOK_URL = "https://storybook.vllnt.com";
const SPONSOR_URL = "https://github.com/sponsors/bntvllnt";
const REPORT_URL =
  "https://github.com/vllnt/ui/issues/new?template=bug_report.yml&labels=bug";
const LICENSE_URL = "https://github.com/vllnt/ui/blob/main/LICENSE";
const COC_URL = "https://github.com/vllnt/ui/blob/main/CODE_OF_CONDUCT.md";

/** The pages of this site that the library column links, in order. */
const LIBRARY_LINKS = [
  { key: "components", path: "/components" },
  { key: "native", path: "/components", query: "?platform=native" },
  { key: "docs", path: "/docs" },
  { key: "vision", path: "/vision" },
  { key: "design", path: "/design" },
  { key: "changelog", path: "/changelog" },
  { key: "releases", path: "/releases" },
  { key: "requestComponent", path: "/request-component" },
] as const;

/**
 * `asset` = a same-origin path outside the app routes (feeds, `llms.txt`,
 * registry JSON, MCP): a plain anchor, never prefixed and never prefetched by
 * the router. `external` = an off-site link opened in a new tab.
 */
const RESOURCE_LINKS = [
  { href: "/r/registry.json", key: "registryJson" },
  { href: "/r/native/registry.json", key: "nativeRegistryJson" },
  { href: "/r/design.json", key: "designTokens" },
  { href: "/rss.xml", key: "rssFeed" },
  { href: "/llms.txt", key: "llmsTxt" },
  { href: "/mcp", key: "mcp" },
  { external: true, href: STORYBOOK_URL, key: "storybook" },
  { external: true, href: GITHUB_URL, key: "github" },
  { external: true, href: REPORT_URL, key: "reportBug" },
  { external: true, href: SPONSOR_URL, key: "sponsor" },
  { external: true, href: LICENSE_URL, key: "license" },
  { external: true, href: COC_URL, key: "codeOfConduct" },
] as const;

const RESOURCE_LINK =
  "inline-flex min-h-6 items-center hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type ResourceLink = {
  readonly external: boolean;
  readonly href: string;
  readonly label: string;
};

/** The row under the columns: the resource links, then who builds and maintains the site. */
function FooterBottom({
  builtWith,
  label,
  links,
  maintainedBy,
}: {
  readonly builtWith: string;
  readonly label: string;
  readonly links: readonly ResourceLink[];
  readonly maintainedBy: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <nav aria-label={label}>
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          {links.map((link) => (
            <li key={link.href}>
              {link.external ? (
                <a
                  className={RESOURCE_LINK}
                  href={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ) : (
                <a className={RESOURCE_LINK} href={link.href}>
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <p className="m-0">
        {builtWith} · {maintainedBy}{" "}
        <a
          className="hover:text-foreground"
          href="https://github.com/vllnt"
          rel="noreferrer"
          target="_blank"
        >
          VLLNT
        </a>
      </p>
    </div>
  );
}

/**
 * The shared site footer: this site's own column first, then the four columns
 * of the VLLNT network. The links that are no page of the app (the registry,
 * the feeds, the license) sit in the row under the columns.
 */
export async function Footer({ locale }: { readonly locale: Locale }) {
  const t = await getTranslations("footer");

  const library: SiteFooterColumn = {
    heading: t("library"),
    id: "library",
    links: LIBRARY_LINKS.map((link) => ({
      href: `${localizePathname(link.path, locale)}${"query" in link ? link.query : ""}`,
      label: t(link.key),
    })),
  };

  const network = networkFooterColumns({
    headings: {
      company: t("networkHeadings.company"),
      learnBuild: t("networkHeadings.learnBuild"),
      legal: t("legal"),
      platforms: t("networkHeadings.platforms"),
    },
    locale,
    pageLabels: {
      "/company": t("pages.company"),
      "/contact": t("pages.contact"),
      "/journal": t("pages.journal"),
      "/legal": t("pages.legal"),
      "/legal/privacy": t("pages.privacy"),
      "/legal/terms": t("pages.terms"),
      "/services": t("pages.services"),
    },
  });

  return (
    <SiteFooter
      bottom={
        <FooterBottom
          builtWith={t("builtWith")}
          label={t("resources")}
          links={RESOURCE_LINKS.map((link) => ({
            external: "external" in link,
            href: link.href,
            label: t(link.key),
          }))}
          maintainedBy={t("maintainedBy")}
        />
      }
      brand="VLLNT UI"
      columns={[library, ...network]}
      navLabel={t("navLabel")}
      otherSite={t("otherSite")}
      tagline={t("tagline")}
    />
  );
}

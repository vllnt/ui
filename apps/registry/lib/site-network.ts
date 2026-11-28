import type { NetworkSwitcherGroup, SiteFooterColumn } from "@vllnt/ui";

/**
 * The sites of the VLLNT network and how this site links them. The shared site
 * shell in `@vllnt/ui` holds none of it: the header switcher and the footer
 * columns come from here, as props.
 */

/** The sites an app of the network can link to. */
export type SiteId =
  | "blueprint"
  | "community"
  | "console"
  | "index"
  | "maia"
  | "oss"
  | "status"
  | "tools"
  | "ui"
  | "www";

type NetworkSite = {
  /** The origin of the site: https, no trailing slash. */
  readonly href: string;
  /** Whether the site has a production deploy. A footer and the switcher hide a site that has none. */
  readonly live: boolean;
  /** A proper noun: no language translates it. */
  readonly name: string;
};

export const NETWORK_SITES = {
  blueprint: {
    href: "https://blueprint.vllnt.com",
    live: true,
    name: "Blueprint",
  },
  community: {
    href: "https://community.vllnt.com",
    live: true,
    name: "Community",
  },
  console: { href: "https://console.vllnt.com", live: true, name: "Console" },
  index: { href: "https://index.vllnt.com", live: true, name: "Index" },
  maia: { href: "https://maia.vllnt.com", live: true, name: "Maia" },
  oss: { href: "https://oss.vllnt.com", live: true, name: "Open Source" },
  status: { href: "https://status.vllnt.com", live: false, name: "Status" },
  tools: { href: "https://tools.vllnt.com", live: true, name: "Tools" },
  ui: { href: "https://ui.vllnt.com", live: true, name: "ui" },
  www: { href: "https://vllnt.com", live: true, name: "vllnt" },
} as const satisfies Record<SiteId, NetworkSite>;

/** The site this app renders. Its row is first in the switcher and it leaves its own footer link out. */
export const CURRENT_SITE: SiteId = "ui";

/**
 * The sites by family, in order. Every site but the parent sits in one family;
 * the footer columns and the header switcher both read it.
 */
const SITE_FAMILIES = {
  directory: ["index", "status"],
  learnBuild: ["blueprint", "community", "oss", "tools", "ui"],
  platforms: ["maia", "console"],
} as const satisfies Record<string, readonly SiteId[]>;

/** The pages of the parent site that every footer links back to. */
export type BrandPath =
  | "/company"
  | "/contact"
  | "/journal"
  | "/legal"
  | "/legal/privacy"
  | "/legal/terms"
  | "/services";

/** Whether each page of the parent site has shipped: a footer links a page while its flag is `true`. */
const BRAND_PAGES_LIVE = {
  "/company": true,
  "/contact": true,
  "/journal": true,
  "/legal": true,
  "/legal/privacy": true,
  "/legal/terms": true,
  "/services": true,
} as const satisfies Record<BrandPath, boolean>;

type Locale = "en" | "fr";

/** The parent site's home in a language: English has no prefix, French lives under `/fr`. */
function parentHome(locale: Locale): string {
  return `${NETWORK_SITES.www.href}${locale === "fr" ? "/fr" : ""}`;
}

type SwitcherHeadings = Record<
  "directory" | "learnBuild" | "platforms",
  string
>;

type GroupSpec = {
  /** Without it the group has no heading. */
  readonly heading?: keyof SwitcherHeadings;
  readonly id: string;
  readonly items: readonly SiteId[];
};

/** What each group holds, in order, after the current site's own group. The parent comes first and alone. */
const SWITCHER_GROUPS: readonly GroupSpec[] = [
  { id: "parent", items: ["www"] },
  { heading: "platforms", id: "platforms", items: SITE_FAMILIES.platforms },
  { heading: "learnBuild", id: "learn-build", items: SITE_FAMILIES.learnBuild },
  { heading: "directory", id: "directory", items: SITE_FAMILIES.directory },
];

/**
 * The groups of the header switcher: this site first, alone and marked current,
 * then the parent, Platforms, Learn and build, and Directory. A site that is not
 * live has no row, and a group with no row does not appear.
 */
export function switcherGroups(
  headings: SwitcherHeadings,
): NetworkSwitcherGroup[] {
  const current = NETWORK_SITES[CURRENT_SITE];
  const others = SWITCHER_GROUPS.flatMap(({ heading, id, items }) => {
    const rows = items
      .filter((site) => site !== CURRENT_SITE && NETWORK_SITES[site].live)
      .map((site) => ({
        current: false,
        href: NETWORK_SITES[site].href,
        label: NETWORK_SITES[site].name,
      }));
    return rows.length > 0
      ? [
          {
            ...(heading === undefined ? {} : { heading: headings[heading] }),
            id,
            items: rows,
          },
        ]
      : [];
  });
  return [
    {
      id: "current",
      items: [{ current: true, href: current.href, label: current.name }],
    },
    ...others,
  ];
}

type FooterHeadings = Record<
  "company" | "learnBuild" | "legal" | "platforms",
  string
>;

type ColumnItem = BrandPath | SiteId;

type ColumnSpec = {
  readonly heading: keyof FooterHeadings;
  readonly id: string;
  readonly items: readonly ColumnItem[];
};

/** What each column holds. The parent comes first in its own column, so every site links it. */
const FOOTER_COLUMNS: readonly ColumnSpec[] = [
  { heading: "platforms", id: "platforms", items: SITE_FAMILIES.platforms },
  { heading: "learnBuild", id: "learn-build", items: SITE_FAMILIES.learnBuild },
  {
    heading: "company",
    id: "company",
    items: [
      "www",
      "/company",
      "/services",
      "/journal",
      "/contact",
      ...SITE_FAMILIES.directory,
    ],
  },
  {
    heading: "legal",
    id: "legal",
    items: ["/legal", "/legal/privacy", "/legal/terms"],
  },
];

function isSiteId(item: ColumnItem): item is SiteId {
  return Object.hasOwn(NETWORK_SITES, item);
}

/** The links one column item gives: none for this site, a site that is not live or a page that is not live. */
function columnLinks(
  item: ColumnItem,
  home: string,
  pageLabels: Record<BrandPath, string>,
): SiteFooterColumn["links"] {
  if (!isSiteId(item)) {
    return BRAND_PAGES_LIVE[item]
      ? [{ href: `${home}${item}`, label: pageLabels[item] }]
      : [];
  }
  const site = NETWORK_SITES[item];
  if (!site.live || item === CURRENT_SITE) return [];
  return [
    {
      external: true,
      href: item === "www" ? home : site.href,
      label: site.name,
    },
  ];
}

/**
 * The four footer columns of the network: Platforms, Learn and build, the
 * parent and Legal. Every site links every other live site and the parent's
 * pages. A site that is not live, this site and a page that is not live have no
 * link, and a column with no link does not appear. A link to another site is
 * `external`; a link to a page of the parent is not.
 */
export function networkFooterColumns({
  headings,
  locale,
  pageLabels,
}: {
  readonly headings: FooterHeadings;
  readonly locale: Locale;
  readonly pageLabels: Record<BrandPath, string>;
}): SiteFooterColumn[] {
  const home = parentHome(locale);

  return FOOTER_COLUMNS.flatMap(({ heading, id, items }) => {
    const links = items.flatMap((item) => columnLinks(item, home, pageLabels));
    return links.length > 0 ? [{ heading: headings[heading], id, links }] : [];
  });
}

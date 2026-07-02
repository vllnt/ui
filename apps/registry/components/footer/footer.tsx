import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/i18n/routing";

const GITHUB_URL = "https://github.com/vllnt/ui";
const STORYBOOK_URL = "https://storybook.vllnt.ai";
const SPONSOR_URL = "https://github.com/sponsors/bntvllnt";
const REPORT_URL =
  "https://github.com/vllnt/ui/issues/new?template=bug_report.yml&labels=bug";
const DISCUSSIONS_URL = "https://github.com/vllnt/ui/discussions";
const LICENSE_URL = "https://github.com/vllnt/ui/blob/main/LICENSE";
const COC_URL = "https://github.com/vllnt/ui/blob/main/CODE_OF_CONDUCT.md";

/**
 * `route` = a locale-prefixed app route (rendered with the localized Link).
 * `asset` = a non-localized same-origin path excluded from the i18n middleware
 * (feeds, llms.txt, registry JSON, MCP) — a plain anchor, never prefixed.
 * `external` = an off-site link opened in a new tab.
 */
type FooterLinkKind = "asset" | "external" | "route";

type FooterLink = {
  readonly href: string;
  readonly kind: FooterLinkKind;
  readonly labelKey: string;
};

type FooterColumn = {
  readonly links: readonly FooterLink[];
  readonly titleKey: string;
};

const COLUMNS: readonly FooterColumn[] = [
  {
    links: [
      { href: "/components", kind: "route", labelKey: "components" },
      { href: "/docs", kind: "route", labelKey: "docs" },
      { href: "/philosophy", kind: "route", labelKey: "philosophy" },
      { href: "/design", kind: "route", labelKey: "design" },
    ],
    titleKey: "library",
  },
  {
    links: [
      { href: STORYBOOK_URL, kind: "external", labelKey: "storybook" },
      { href: "/r/registry.json", kind: "asset", labelKey: "registryJson" },
      { href: "/r/design.json", kind: "asset", labelKey: "designTokens" },
      { href: "/changelog", kind: "route", labelKey: "changelog" },
      { href: "/releases", kind: "route", labelKey: "releases" },
      { href: "/rss.xml", kind: "asset", labelKey: "rssFeed" },
      { href: "/llms.txt", kind: "asset", labelKey: "llmsTxt" },
      { href: "/mcp", kind: "asset", labelKey: "mcp" },
      { href: GITHUB_URL, kind: "external", labelKey: "github" },
    ],
    titleKey: "resources",
  },
  {
    links: [
      {
        href: "/request-component",
        kind: "route",
        labelKey: "requestComponent",
      },
      { href: REPORT_URL, kind: "external", labelKey: "reportBug" },
      { href: DISCUSSIONS_URL, kind: "external", labelKey: "discussions" },
      { href: SPONSOR_URL, kind: "external", labelKey: "sponsor" },
    ],
    titleKey: "community",
  },
  {
    links: [
      { href: LICENSE_URL, kind: "external", labelKey: "license" },
      { href: COC_URL, kind: "external", labelKey: "codeOfConduct" },
    ],
    titleKey: "legal",
  },
];

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.titleKey}>
              <h3 className="text-sm font-semibold">{t(column.titleKey)}</h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterAnchor href={link.href} kind={link.kind}>
                      {t(link.labelKey)}
                    </FooterAnchor>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{t("builtWith")}</p>
          <p className="text-xs text-muted-foreground">
            {t("maintainedBy")}{" "}
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
      </div>
    </footer>
  );
}

function FooterAnchor({
  children,
  href,
  kind,
}: {
  children: ReactNode;
  href: string;
  kind: FooterLinkKind;
}) {
  const className = "text-sm text-muted-foreground hover:text-foreground";

  if (kind === "route") {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  if (kind === "external") {
    return (
      <a className={className} href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

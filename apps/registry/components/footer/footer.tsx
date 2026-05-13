/* eslint-disable max-lines-per-function */

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

const GITHUB_URL = "https://github.com/vllnt/ui";
const STORYBOOK_URL = "https://storybook.vllnt.ai";
const SPONSOR_URL = "https://github.com/sponsors/bntvllnt";
const REQUEST_URL =
  "https://github.com/vllnt/ui/issues/new?template=feature_request.yml&labels=enhancement,component";
const REPORT_URL =
  "https://github.com/vllnt/ui/issues/new?template=bug_report.yml&labels=bug";
const DISCUSSIONS_URL = "https://github.com/vllnt/ui/discussions";
const LICENSE_URL = "https://github.com/vllnt/ui/blob/main/LICENSE";
const COC_URL = "https://github.com/vllnt/ui/blob/main/CODE_OF_CONDUCT.md";

type FooterLink = {
  readonly external?: boolean;
  readonly href: string;
  readonly label: string;
  readonly localized?: boolean;
};

type FooterColumn = {
  readonly links: readonly FooterLink[];
  readonly title: string;
};

export function Footer() {
  const t = useTranslations("footer");
  const common = useTranslations("common");
  const columns: readonly FooterColumn[] = [
    {
      links: [
        { href: "/components", label: common("components") },
        { href: "/docs", label: common("docs") },
        { href: "/philosophy", label: common("philosophy") },
      ],
      title: t("library"),
    },
    {
      links: [
        { external: true, href: STORYBOOK_URL, label: t("storybook") },
        {
          href: "/r/registry.json",
          label: t("registryJson"),
          localized: false,
        },
        { href: "/llms.txt", label: "llms.txt", localized: false },
        { href: "/mcp", label: "MCP", localized: false },
        { external: true, href: GITHUB_URL, label: common("github") },
      ],
      title: t("resources"),
    },
    {
      links: [
        {
          external: true,
          href: REQUEST_URL,
          label: common("requestComponent"),
        },
        { external: true, href: REPORT_URL, label: t("reportBug") },
        { external: true, href: DISCUSSIONS_URL, label: t("discussions") },
        { external: true, href: SPONSOR_URL, label: t("sponsor") },
      ],
      title: t("community"),
    },
    {
      links: [
        { external: true, href: LICENSE_URL, label: "License (MIT)" },
        { external: true, href: COC_URL, label: "Code of Conduct" },
      ],
      title: t("legal"),
    },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) =>
                  link.external || link.localized === false ? (
                    <li key={link.href}>
                      <a
                        className="text-sm text-muted-foreground hover:text-foreground"
                        href={link.href}
                        rel={link.external ? "noreferrer" : undefined}
                        target={link.external ? "_blank" : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link
                        className="text-sm text-muted-foreground hover:text-foreground"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
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

import Link from "next/link";

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
};

type FooterColumn = {
  readonly links: readonly FooterLink[];
  readonly title: string;
};

const COLUMNS: readonly FooterColumn[] = [
  {
    links: [
      { href: "/components", label: "Components" },
      { href: "/docs", label: "Docs" },
      { href: "/philosophy", label: "Philosophy" },
      { href: "/design", label: "Design" },
    ],
    title: "Library",
  },
  {
    links: [
      { external: true, href: STORYBOOK_URL, label: "Storybook" },
      { href: "/r/registry.json", label: "Registry JSON" },
      { href: "/r/design.json", label: "Design tokens" },
      { href: "/llms.txt", label: "llms.txt" },
      { href: "/mcp", label: "MCP" },
      { external: true, href: GITHUB_URL, label: "GitHub" },
    ],
    title: "Resources",
  },
  {
    links: [
      { external: true, href: REQUEST_URL, label: "Request a component" },
      { external: true, href: REPORT_URL, label: "Report a bug" },
      { external: true, href: DISCUSSIONS_URL, label: "Discussions" },
      { external: true, href: SPONSOR_URL, label: "Sponsor" },
    ],
    title: "Community",
  },
  {
    links: [
      { external: true, href: LICENSE_URL, label: "License (MIT)" },
      { external: true, href: COC_URL, label: "Code of Conduct" },
    ],
    title: "Legal",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) =>
                  link.external ? (
                    <li key={link.href}>
                      <a
                        className="text-sm text-muted-foreground hover:text-foreground"
                        href={link.href}
                        rel="noreferrer"
                        target="_blank"
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
          <p className="text-xs text-muted-foreground">
            VLLNT UI · MIT licensed · Built with Radix UI, Tailwind CSS, and CVA
          </p>
          <p className="text-xs text-muted-foreground">
            Maintained by{" "}
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

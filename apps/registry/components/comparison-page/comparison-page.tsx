import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Footer } from "@/components/footer/footer";
import type { Locale } from "@/i18n/routing";
import { breadcrumbLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, SITE_URL } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

/** One attribute row in a comparison table. */
export type ComparisonRow = {
  readonly attribute: string;
  /** The competitor's cell. */
  readonly other: string;
  /** The VLLNT UI cell. */
  readonly vllnt: string;
  /** Bold the winning cell; omit (or "even") for no emphasis. */
  readonly winner?: "even" | "other" | "vllnt";
};

export type ComparisonPageProps = {
  /** Prose rendered below the table (e.g. "when to pick which"). */
  readonly afterTable?: ReactNode;
  /** Column label for the competitor (e.g. "shadcn/ui"). */
  readonly competitorLabel: string;
  /** Optional call-to-action link rendered after the content. */
  readonly cta?: { readonly href: string; readonly label: string };
  /** Optional small uppercase line above the title. */
  readonly eyebrow?: string;
  /** Intro content rendered between the title and the table. */
  readonly intro: ReactNode;
  readonly locale: Locale;
  /** Route pathname (e.g. "/vs/shadcn") for JSON-LD and canonical URLs. */
  readonly pathname: string;
  readonly rows: readonly ComparisonRow[];
  readonly title: string;
};

type ComparisonMetadataOptions = {
  readonly description: string;
  readonly locale: Locale;
  readonly pathname: string;
  readonly title: string;
};

/**
 * Builds the full metadata for a comparison page — canonical, language
 * alternates, Open Graph, and Twitter cards from one description.
 */
export function comparisonPageMetadata({
  description,
  locale,
  pathname,
  title,
}: ComparisonMetadataOptions): Metadata {
  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description,
    openGraph: generateOGMetadata({ description, title }, { locale, pathname }),
    title,
    twitter: generateTwitterMetadata({ description, title }),
  };
}

function winnerCellClassName(isWinner: boolean): string {
  return isWinner ? "p-3 font-semibold" : "p-3 text-muted-foreground";
}

function ComparisonTable({
  competitorLabel,
  rows,
}: {
  readonly competitorLabel: string;
  readonly rows: readonly ComparisonRow[];
}): ReactNode {
  return (
    <div className="mt-12 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left font-semibold">Attribute</th>
            <th className="p-3 text-left font-semibold">VLLNT UI</th>
            <th className="p-3 text-left font-semibold">{competitorLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className="border-t border-border align-top"
              key={row.attribute}
            >
              <td className="p-3 font-medium">{row.attribute}</td>
              <td className={winnerCellClassName(row.winner === "vllnt")}>
                {row.vllnt}
              </td>
              <td className={winnerCellClassName(row.winner === "other")}>
                {row.other}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Shared frame for every "VLLNT UI vs X" page: JSON-LD breadcrumb, sidebar,
 * title, intro, the side-by-side table with winner emphasis, optional prose
 * and CTA, and the footer. Pages supply the data and content.
 */
export function ComparisonPage({
  afterTable,
  competitorLabel,
  cta,
  eyebrow,
  intro,
  locale,
  pathname,
  rows,
  title,
}: ComparisonPageProps): ReactNode {
  return (
    <>
      <script
        {...jsonLdScriptAttributes(
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            { name: title, url: `${SITE_URL}${pathname}` },
          ]),
        )}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
          {eyebrow ? (
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-4xl font-semibold leading-tight md:text-5xl">
            {title}
          </h1>

          {intro}

          <ComparisonTable competitorLabel={competitorLabel} rows={rows} />

          {afterTable}

          {cta ? (
            <div className="mt-12 border-t border-border pt-8">
              <Link
                className="inline-flex items-center gap-1 font-medium text-foreground underline"
                href={cta.href}
              >
                {cta.label}
              </Link>
            </div>
          ) : null}
        </div>
        <Footer />
      </main>
    </>
  );
}

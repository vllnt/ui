import { Badge, Breadcrumb, Button, MDXContent, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { type ChangelogTypeFilter, getChangelogEntries } from "@/lib/changelog";
import { breadcrumbLd, jsonLdScript } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

type SearchParameters = {
  readonly from?: string;
  readonly to?: string;
  readonly type?: string;
};

type LocaleParameters = {
  readonly params: Promise<{ locale: Locale }>;
};

const CHANGELOG_TYPES: readonly {
  readonly label: string;
  readonly value: ChangelogTypeFilter;
}[] = [
  { label: "All changes", value: "all" },
  { label: "Features", value: "feat" },
  { label: "Fixes", value: "fix" },
  { label: "Breaking", value: "breaking" },
];

const DESCRIPTION =
  "Browse VLLNT UI release notes from the canonical Keep a Changelog source, with filters for features, fixes, breaking changes, and release date.";

export async function generateMetadata({
  params,
}: LocaleParameters): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical("/changelog", locale),
      languages: languageAlternates("/changelog"),
    },
    description: DESCRIPTION,
    openGraph: generateOGMetadata(
      {
        description: DESCRIPTION,
        title: "Changelog · VLLNT UI",
        type: "docs",
      },
      { locale, pathname: "/changelog" },
    ),
    title: "Changelog · VLLNT UI",
    twitter: generateTwitterMetadata({
      description: DESCRIPTION,
      title: "Changelog · VLLNT UI",
      type: "docs",
    }),
  };
}

function normalizeType(value?: string): ChangelogTypeFilter {
  if (value === "breaking" || value === "feat" || value === "fix") {
    return value;
  }
  return "all";
}

function FilterControls({
  from,
  locale,
  to,
  type,
}: {
  readonly from?: string;
  readonly locale: Locale;
  readonly to?: string;
  readonly type: ChangelogTypeFilter;
}) {
  return (
    <form
      action={localizePathname("/changelog", locale)}
      className="mt-8 grid gap-3 border border-border p-4 sm:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)_auto]"
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="changelog-type">
          Type
        </label>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
          defaultValue={type}
          id="changelog-type"
          name="type"
        >
          {CHANGELOG_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="changelog-from">
          From
        </label>
        <input
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
          defaultValue={from}
          id="changelog-from"
          name="from"
          type="date"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="changelog-to">
          To
        </label>
        <input
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
          defaultValue={to}
          id="changelog-to"
          name="to"
          type="date"
        />
      </div>
      <div className="flex items-end gap-2">
        <Button className="w-full sm:w-auto" type="submit">
          Apply
        </Button>
      </div>
    </form>
  );
}

export default async function ChangelogPage({
  params,
  searchParams,
}: LocaleParameters & {
  readonly searchParams: Promise<SearchParameters>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const parameters = await searchParams;
  const type = normalizeType(parameters.type);
  const entries = await getChangelogEntries({
    from: parameters.from,
    to: parameters.to,
    type,
  });
  const latestDate = entries.find((e) => e.date)?.date;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbLd([
              { name: "Home", url: SITE_URL },
              { name: "Changelog", url: `${SITE_URL}/changelog` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Article",
              ...(latestDate
                ? { dateModified: new Date(latestDate).toISOString() }
                : {}),
              description: DESCRIPTION,
              headline: "VLLNT UI Changelog",
              mainEntityOfPage: `${SITE_URL}/changelog`,
              publisher: {
                "@type": "Organization",
                name: "VLLNT",
              },
            },
          ]),
        }}
        type="application/ld+json"
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
            items={[
              { href: localizePathname("/", locale), label: "Home" },
              { label: "Changelog" },
            ]}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Release history
              </p>
              <h1 className="mt-2 text-4xl font-semibold">Changelog</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                The canonical release log for VLLNT UI, generated from
                Conventional Commits into Keep a Changelog format.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/rss.xml">RSS feed</Link>
            </Button>
          </div>

          <FilterControls
            from={parameters.from}
            locale={locale}
            to={parameters.to}
            type={type}
          />

          <div className="mt-10 space-y-10">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <article
                  className="border-b border-border pb-10 last:border-b-0 last:pb-0"
                  id={entry.anchor}
                  key={entry.anchor}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold">{entry.title}</h2>
                    {entry.date ? (
                      <Badge variant="secondary">{entry.date}</Badge>
                    ) : null}
                    <Link
                      aria-label={`Permalink to ${entry.title}`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                      href={`${localizePathname("/changelog", locale)}#${entry.anchor}`}
                    >
                      #{entry.anchor}
                    </Link>
                  </div>
                  <div className="mt-6 space-y-8">
                    {entry.sections.map((section) => (
                      <section key={`${entry.anchor}-${section.title}`}>
                        <div className="mb-3 flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {section.title}
                          </h3>
                          <Badge variant="outline">{section.type}</Badge>
                        </div>
                        <MDXContent content={section.body} enableMDX={false} />
                      </section>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="border border-border p-8">
                <h2 className="text-xl font-semibold">No changes found</h2>
                <p className="mt-2 text-muted-foreground">
                  Adjust the filters to include more release notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

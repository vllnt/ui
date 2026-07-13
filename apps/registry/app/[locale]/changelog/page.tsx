import { Badge, Breadcrumb, Button, MDXContent, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link, type Locale } from "@/i18n/routing";
import { type ChangelogTypeFilter, getChangelogEntries } from "@/lib/changelog";
import { breadcrumbTrailLd, jsonLdScript } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type SearchParameters = {
  readonly from?: string;
  readonly to?: string;
  readonly type?: string;
};

type LocaleParameters = {
  readonly params: Promise<{ locale: Locale }>;
};

const CHANGELOG_TYPES: readonly {
  readonly labelKey: string;
  readonly value: ChangelogTypeFilter;
}[] = [
  { labelKey: "filterAll", value: "all" },
  { labelKey: "filterFeatures", value: "feat" },
  { labelKey: "filterFixes", value: "fix" },
  { labelKey: "filterBreaking", value: "breaking" },
];

const DESCRIPTION =
  "Browse VLLNT UI release notes from the canonical Keep a Changelog source, with filters for features, fixes, breaking changes, and release date.";

export async function generateMetadata({
  params,
}: LocaleParameters): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.changelog" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    alternates: {
      canonical: canonical("/changelog", locale),
      languages: languageAlternates("/changelog"),
    },
    description,
    openGraph: generateOGMetadata(
      {
        description,
        title,
        type: "docs",
      },
      { locale, pathname: "/changelog" },
    ),
    title,
    twitter: generateTwitterMetadata({
      description,
      title,
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

async function FilterControls({
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
  const t = await getTranslations("pages.changelog");
  return (
    <form
      action={localizePathname("/changelog", locale)}
      className="mt-8 grid gap-3 border border-border p-4 sm:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)_auto]"
    >
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="changelog-type">
          {t("filterType")}
        </label>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal"
          defaultValue={type}
          id="changelog-type"
          name="type"
        >
          {CHANGELOG_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="changelog-from">
          {t("filterFrom")}
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
          {t("filterTo")}
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
          {t("filterApply")}
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
  const t = await getTranslations("pages.changelog");
  const common = await getTranslations("common");
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
            breadcrumbTrailLd(locale, [
              { name: "Changelog", path: "/changelog" },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Article",
              ...(latestDate
                ? { dateModified: new Date(latestDate).toISOString() }
                : {}),
              description: DESCRIPTION,
              headline: "VLLNT UI Changelog",
              mainEntityOfPage: canonical("/changelog", locale),
              publisher: {
                "@type": "Organization",
                name: "VLLNT",
              },
            },
          ]),
        }}
        type="application/ld+json"
      />
      <Sidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
            items={[
              { href: localizePathname("/", locale), label: common("home") },
              { label: t("heading") },
            ]}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {t("eyebrow")}
              </p>
              <h1 className="mt-2 text-4xl font-semibold">{t("heading")}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                {t("intro")}
              </p>
            </div>
            <Button asChild variant="outline">
              <a href="/rss.xml">{t("rssLink")}</a>
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
                      aria-label={t("permalinkTo", { title: entry.title })}
                      className="text-sm text-muted-foreground hover:text-foreground"
                      href={`/changelog#${entry.anchor}`}
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
                <h2 className="text-xl font-semibold">{t("emptyTitle")}</h2>
                <p className="mt-2 text-muted-foreground">
                  {t("emptyDescription")}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

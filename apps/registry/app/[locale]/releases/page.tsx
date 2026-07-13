import { Badge, Breadcrumb, Button, MDXContent, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link, type Locale } from "@/i18n/routing";
import { getReleaseRecords } from "@/lib/changelog";
import { breadcrumbTrailLd, jsonLdScript } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.releases" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    alternates: {
      canonical: canonical("/releases", locale),
      languages: languageAlternates("/releases"),
    },
    description,
    openGraph: generateOGMetadata(
      {
        description,
        title,
        type: "docs",
      },
      { locale, pathname: "/releases" },
    ),
    title,
    twitter: generateTwitterMetadata({
      description,
      title,
      type: "docs",
    }),
  };
}

async function formatComponentDelta(value?: number): Promise<string> {
  const t = await getTranslations("pages.releases");
  if (value === undefined) {
    return t("componentsNotRecorded");
  }
  const delta = value > 0 ? `+${value}` : `${value}`;
  return t("componentDelta", { delta });
}

async function ReleaseCard({
  isLatest,
  release,
}: {
  readonly isLatest: boolean;
  readonly release: Awaited<ReturnType<typeof getReleaseRecords>>[number];
}) {
  const t = await getTranslations("pages.releases");
  return (
    <article className="border border-border p-6" id={release.anchor}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              className="inline-flex"
              href={release.url}
              rel="noreferrer"
              target="_blank"
            >
              <Badge>{release.version}</Badge>
            </a>
            {isLatest ? (
              <Badge variant="secondary">{t("whatsNew")}</Badge>
            ) : null}
            {release.date ? (
              <span className="text-sm text-muted-foreground">
                {release.date}
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-2xl font-semibold">{release.title}</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {release.summary}
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={release.url} rel="noreferrer" target="_blank">
            {t("viewOnGithub")}
          </a>
        </Button>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("components")}
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {await formatComponentDelta(release.componentDelta)}
          </dd>
        </div>
        <div className="border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("breakingChanges")}
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {release.breakingChanges}
          </dd>
        </div>
        <div className="border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("migration")}
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {release.migrationUrl ? (
              <a
                className="underline underline-offset-4"
                href={release.migrationUrl}
                rel="noreferrer"
                target="_blank"
              >
                {t("openGuide")}
              </a>
            ) : (
              t("none")
            )}
          </dd>
        </div>
      </dl>

      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium">
          {t("fullReleaseNotes")}
        </summary>
        <div className="mt-4">
          <MDXContent content={release.notes} enableMDX={false} />
        </div>
      </details>
    </article>
  );
}

function releaseJsonLdItem(
  release: Awaited<ReturnType<typeof getReleaseRecords>>[number],
  index: number,
  locale: Locale,
) {
  return {
    "@type": "ListItem",
    item: {
      "@type": "SoftwareSourceCode",
      codeRepository: "https://github.com/vllnt/ui",
      ...(release.date ? { datePublished: release.date } : {}),
      name: release.version,
      programmingLanguage: "TypeScript",
      runtimePlatform: "React",
      url: `${canonical("/releases", locale)}#${release.anchor}`,
    },
    position: index + 1,
  };
}

export default async function ReleasesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.releases");
  const common = await getTranslations("common");
  const releases = await getReleaseRecords();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbTrailLd(locale, [
              { name: "Releases", path: "/releases" },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: releases.map((release, index) =>
                releaseJsonLdItem(release, index, locale),
              ),
              name: "VLLNT UI Releases",
              numberOfItems: releases.length,
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
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/changelog">{t("changelogLink")}</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="/atom.xml">{t("atomLink")}</a>
              </Button>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {releases.map((release, index) => (
              <ReleaseCard
                isLatest={index === 0}
                key={release.anchor}
                release={release}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

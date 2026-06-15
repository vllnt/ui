import { Badge, Breadcrumb, Button, MDXContent, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";

import type { Locale } from "@/i18n/routing";
import { getReleaseRecords } from "@/lib/changelog";
import { breadcrumbLd, jsonLdScript } from "@/lib/jsonld";
import { resolveLocaleParameters } from "@/lib/locale";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { SITE_URL } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

const DESCRIPTION =
  "Read VLLNT UI releases, including latest notes, component count deltas, breaking change counts, migration links, and GitHub release links.";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical("/releases", locale),
      languages: languageAlternates("/releases"),
    },
    description: DESCRIPTION,
    openGraph: generateOGMetadata(
      {
        description: DESCRIPTION,
        title: "Releases · VLLNT UI",
        type: "docs",
      },
      { locale, pathname: "/releases" },
    ),
    title: "Releases · VLLNT UI",
    twitter: generateTwitterMetadata({
      description: DESCRIPTION,
      title: "Releases · VLLNT UI",
      type: "docs",
    }),
  };
}

function formatComponentDelta(value?: number): string {
  if (value === undefined) {
    return "Not recorded";
  }
  return value > 0 ? `+${value} components` : `${value} components`;
}

function ReleaseCard({
  isLatest,
  release,
}: {
  readonly isLatest: boolean;
  readonly release: Awaited<ReturnType<typeof getReleaseRecords>>[number];
}) {
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
              <Badge variant="secondary">What&apos;s new</Badge>
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
            View on GitHub
          </a>
        </Button>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Components
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {formatComponentDelta(release.componentDelta)}
          </dd>
        </div>
        <div className="border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Breaking changes
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {release.breakingChanges}
          </dd>
        </div>
        <div className="border border-border p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Migration
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {release.migrationUrl ? (
              <a
                className="underline underline-offset-4"
                href={release.migrationUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open guide
              </a>
            ) : (
              "None"
            )}
          </dd>
        </div>
      </dl>

      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium">
          Full release notes
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
      url: `${SITE_URL}/releases#${release.anchor}`,
    },
    position: index + 1,
  };
}

export default async function ReleasesPage({ params }: Props) {
  const { locale } = await resolveLocaleParameters(params);
  const releases = await getReleaseRecords();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbLd([
              { name: "Home", url: SITE_URL },
              { name: "Releases", url: `${SITE_URL}/releases` },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: releases.map(releaseJsonLdItem),
              name: "VLLNT UI Releases",
              numberOfItems: releases.length,
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
              { label: "Releases" },
            ]}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                What&apos;s new
              </p>
              <h1 className="mt-2 text-4xl font-semibold">Releases</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Versioned release cards from GitHub Releases, backed by the
                canonical changelog when the API is unavailable.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={localizePathname("/changelog", locale)}>
                  Changelog
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/atom.xml">Atom</Link>
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

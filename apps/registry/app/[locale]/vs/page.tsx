import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import {
  breadcrumbLd,
  collectionPageLd,
  jsonLdScriptAttributes,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const ogParameters = {
    description:
      "Honest, evidence-based comparison of VLLNT UI vs shadcn/ui, Radix UI, HeadlessUI, and NextUI.",
    title: "VLLNT UI vs · Comparisons",
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical("/vs", locale),
      languages: languageAlternates("/vs"),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, { locale, pathname: "/vs" }),
    title: ogParameters.title,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

const COMPARISONS: readonly {
  readonly available: boolean;
  readonly name: string;
  readonly slug: string;
  readonly tagline: string;
}[] = [
  {
    available: true,
    name: "shadcn/ui",
    slug: "shadcn",
    tagline:
      "Closest sibling. Same registry format. Different component count and agent surface.",
  },
  {
    available: false,
    name: "Radix UI",
    slug: "radix",
    tagline: "Accessible primitives — VLLNT UI is built on top of these.",
  },
  {
    available: false,
    name: "HeadlessUI",
    slug: "headless-ui",
    tagline: "Tailwind Labs primitives — different ecosystem.",
  },
  {
    available: false,
    name: "NextUI",
    slug: "nextui",
    tagline: "Component library with its own design language.",
  },
];

export default async function VsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbLd([
            { name: "Home", url: canonical("/", locale) },
            { name: "Comparisons", url: canonical("/vs", locale) },
          ]),
          collectionPageLd({
            description:
              "Honest, evidence-based comparisons of VLLNT UI against shadcn/ui, Radix UI, HeadlessUI, and NextUI.",
            items: COMPARISONS.filter((entry) => entry.available).map(
              (entry) => ({
                name: `VLLNT UI vs ${entry.name}`,
                url: canonical(`/vs/${entry.slug}`, locale),
              }),
            ),
            title: "VLLNT UI vs the rest",
            url: canonical("/vs", locale),
          }),
        ])}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">VLLNT UI vs the rest</h1>
          <p className="text-muted-foreground text-lg mb-10">
            Honest comparisons. We call out where alternatives are stronger,
            where VLLNT UI fits better, and where the gap is small enough to not
            matter.
          </p>

          <ul className="space-y-3">
            {COMPARISONS.map((entry) =>
              entry.available ? (
                <li key={entry.slug}>
                  <Link
                    className="block rounded-lg border border-border p-5 hover:border-foreground/40"
                    href={localizePathname(`/vs/${entry.slug}`, locale)}
                  >
                    <p className="text-lg font-semibold">
                      VLLNT UI vs {entry.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.tagline}
                    </p>
                  </Link>
                </li>
              ) : (
                <li
                  className="rounded-lg border border-dashed border-border p-5 opacity-60"
                  key={entry.slug}
                >
                  <p className="text-lg font-semibold">
                    VLLNT UI vs {entry.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.tagline}. Page coming soon.
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      </main>
    </>
  );
}

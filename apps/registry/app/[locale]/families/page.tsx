import { Breadcrumb, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import type { Locale } from "@/i18n/routing";
import {
  breadcrumbLd,
  collectionPageLd,
  jsonLdScriptAttributes,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  familyPath,
  getCategoryDescription,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const PATHNAME = "/families";
const TITLE = "Component families";
const DESCRIPTION =
  "Browse VLLNT UI by family — AI, forms, data, overlays, navigation, content, and more. Every component installs independently with the shadcn CLI.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical(PATHNAME, locale),
      languages: languageAlternates(PATHNAME),
    },
    description: DESCRIPTION,
    openGraph: generateOGMetadata(
      { description: DESCRIPTION, title: TITLE, type: "page" },
      { locale, pathname: PATHNAME },
    ),
    title: `${TITLE} — VLLNT UI`,
    twitter: generateTwitterMetadata({
      description: DESCRIPTION,
      title: TITLE,
      type: "page",
    }),
  };
}

export default async function FamiliesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            { name: "Components", url: `${SITE_URL}/components` },
            { name: "Families", url: `${SITE_URL}${PATHNAME}` },
          ]),
          collectionPageLd({
            description: DESCRIPTION,
            items: groupedComponents.map((group) => ({
              name: `${group.label} components`,
              url: `${SITE_URL}${familyPath(group.category)}`,
            })),
            title: TITLE,
            url: `${SITE_URL}${PATHNAME}`,
          }),
        ])}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
            items={[
              { href: localizePathname("/", locale), label: "Home" },
              {
                href: localizePathname("/components", locale),
                label: "Components",
              },
              { label: "Families" },
            ]}
          />
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">Component families</h1>
            <p className="text-muted-foreground text-lg">{DESCRIPTION}</p>
            <p className="text-muted-foreground text-sm mt-2">
              {`${groupedComponents.length} families`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedComponents.map((group) => (
              <Link
                className="group flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20"
                href={localizePathname(familyPath(group.category), locale)}
                key={group.category}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold transition-colors group-hover:text-foreground">
                    {group.label}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {group.items.length}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {getCategoryDescription(group.category)}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

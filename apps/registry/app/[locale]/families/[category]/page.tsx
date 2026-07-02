import { Breadcrumb, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { type Locale, routing } from "@/i18n/routing";
import { getFamilyCopy } from "@/lib/family-copy";
import {
  breadcrumbLd,
  collectionPageLd,
  faqPageLd,
  jsonLdScriptAttributes,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  getCategoryDescription,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";
import type { ComponentCategory } from "@/types/registry";

type Props = {
  readonly params: Promise<{ category: string; locale: Locale }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

/**
 * Component families that get their own landing page. `ai` stays out — its
 * curated landing lives at `/ai` (see `familyPath`).
 */
const familyGroups = groupedComponents.filter(
  (group) => group.category !== "ai",
);

function findFamily(category: string) {
  return familyGroups.find((group) => group.category === category);
}

export function generateStaticParams(): {
  category: ComponentCategory;
  locale: Locale;
}[] {
  return routing.locales.flatMap((locale) =>
    familyGroups.map((group) => ({ category: group.category, locale })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, locale } = await params;
  const group = findFamily(category);

  if (!group) {
    return {};
  }

  const pathname = `/families/${category}`;
  const title = `${group.label} components`;
  const copy = getFamilyCopy(group.category);
  const description = copy?.intro ?? getCategoryDescription(group.category);

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description,
    openGraph: generateOGMetadata(
      { category: group.label, description, title, type: "page" },
      { locale, pathname },
    ),
    title,
    twitter: generateTwitterMetadata({
      category: group.label,
      description,
      title,
      type: "page",
    }),
  };
}

export default async function FamilyPage({ params }: Props) {
  const { category, locale } = await params;
  setRequestLocale(locale);

  const group = findFamily(category);

  if (!group) {
    notFound();
  }

  const copy = getFamilyCopy(group.category);
  const description = copy?.intro ?? getCategoryDescription(group.category);
  const pathname = `/families/${category}`;

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            { name: "Components", url: `${SITE_URL}/components` },
            { name: group.label, url: `${SITE_URL}${pathname}` },
          ]),
          collectionPageLd({
            description,
            items: group.items.map((item) => ({
              name: item.title,
              url: `${SITE_URL}/components/${item.name}`,
            })),
            title: `${group.label} components`,
            url: `${SITE_URL}${pathname}`,
          }),
          ...(copy && copy.faq.length > 0 ? [faqPageLd(copy.faq)] : []),
        ])}
      />
      <Sidebar sections={getSidebarSections(group.category, locale)} />
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
              { label: group.label },
            ]}
          />
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">
              {group.label} components
            </h1>
            {description ? (
              <p className="text-muted-foreground text-lg">{description}</p>
            ) : null}
            <p className="text-muted-foreground text-sm mt-2">
              {`${group.items.length} ${group.items.length === 1 ? "component" : "components"}`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((component) => (
              <ComponentCard
                key={component.name}
                locale={locale}
                slug={component.name}
              />
            ))}
          </div>

          {copy && copy.faq.length > 0 ? (
            <section className="mt-16">
              <h2 className="text-2xl font-semibold">Frequently asked</h2>
              <dl className="mt-6 space-y-6">
                {copy.faq.map((item) => (
                  <div className="max-w-3xl" key={item.question}>
                    <dt className="font-medium">{item.question}</dt>
                    <dd className="mt-2 text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}

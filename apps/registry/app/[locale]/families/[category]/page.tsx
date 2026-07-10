import { Breadcrumb, Sidebar } from "@vllnt/ui";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { Footer } from "@/components/footer/footer";
import { type Locale, routing } from "@/i18n/routing";
import { getFamilyCopy } from "@/lib/family-copy";
import { getFamilyGroups } from "@/lib/family-groups";
import {
  breadcrumbTrailLd,
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

function findFamily(category: string) {
  return groupedComponents.find((group) => group.category === category);
}

export function generateStaticParams(): {
  category: ComponentCategory;
  locale: Locale;
}[] {
  return routing.locales.flatMap((locale) =>
    groupedComponents.map((group) => ({ category: group.category, locale })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, locale } = await params;
  const group = findFamily(category);

  if (!group) {
    return {};
  }

  const pathname = `/families/${category}`;
  const copy = getFamilyCopy(group.category);
  const description = copy?.intro ?? getCategoryDescription(group.category);
  const ogTitle = `${group.label} components`;
  const lower = group.label.toLowerCase();
  const keywords = [
    `${lower} components`,
    `react ${lower} components`,
    `${lower} ui components`,
    `${lower} component library`,
    `shadcn ${lower} components`,
    `accessible ${lower} components`,
    ...group.items
      .slice(0, 6)
      .map((item) => `${item.title.toLowerCase()} component`),
  ];

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description,
    keywords,
    openGraph: generateOGMetadata(
      { category: group.label, description, title: ogTitle, type: "page" },
      { locale, pathname },
    ),
    title: `${group.label} Components — VLLNT UI`,
    twitter: generateTwitterMetadata({
      category: group.label,
      description,
      title: ogTitle,
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
  const groups = getFamilyGroups(group.category);
  const pathname = `/families/${category}`;

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [
            { name: "Components", path: "/components" },
            { name: group.label, path: pathname },
          ]),
          collectionPageLd({
            description,
            items: group.items.map((item) => ({
              name: item.title,
              url: canonical(`/components/${item.name}`, locale),
            })),
            title: `${group.label} components`,
            url: canonical(pathname, locale),
          }),
          ...(copy && copy.faq.length > 0 ? [faqPageLd(copy.faq)] : []),
        ])}
      />
      <Sidebar sections={getSidebarSections(group.category, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <Breadcrumb
              className="mb-6 text-muted-foreground"
              items={[
                { href: localizePathname("/", locale), label: "Home" },
                {
                  href: localizePathname("/components", locale),
                  label: "Components",
                },
                { label: group.label },
              ]}
            />
            <p className="text-sm font-medium text-muted-foreground">
              VLLNT UI · Component family
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              {group.label} components
            </h1>
            {description ? (
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                {description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
                href={localizePathname("/components", locale)}
              >
                Browse all components
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
                href={localizePathname("/docs/agents", locale)}
              >
                How agents consume the registry
              </Link>
              <span className="text-sm text-muted-foreground">
                {`${group.items.length} ${group.items.length === 1 ? "component" : "components"}`}
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            {groups ? (
              <div className="space-y-14">
                {groups.map((section) => (
                  <div key={section.heading}>
                    <h2 className="text-2xl font-semibold">
                      {section.heading}
                    </h2>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                      {section.blurb}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {section.slugs.map((slug) => (
                        <ComponentCard key={slug} locale={locale} slug={slug} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((component) => (
                  <ComponentCard
                    key={component.name}
                    locale={locale}
                    slug={component.name}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <p className="text-sm font-medium text-muted-foreground">
              Readable by agents
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Your AI agent can install these too.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              The registry is exposed as structured data, so coding agents pick
              the right component without scraping HTML.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <a
                className="rounded-lg border border-border p-5 hover:border-foreground/40"
                href="/llms.txt"
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-mono text-sm">/llms.txt</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Concise index per the llmstxt.org spec — sections, links, and
                  descriptions.
                </p>
              </a>
              <a
                className="rounded-lg border border-border p-5 hover:border-foreground/40"
                href="/llms-full.txt"
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-mono text-sm">/llms-full.txt</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Full registry context in one fetch — docs plus every component
                  descriptor.
                </p>
              </a>
              <Link
                className="rounded-lg border border-border p-5 hover:border-foreground/40"
                href={localizePathname("/docs/agents", locale)}
              >
                <p className="font-mono text-sm">{"/r/<name>.json"}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Per-component descriptor: props, accessibility schema, and
                  usage examples.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {copy && copy.faq.length > 0 ? (
          <section>
            <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
              <h2 className="text-2xl font-semibold">Frequently asked</h2>
              <dl className="mt-8 space-y-8">
                {copy.faq.map((item) => (
                  <div className="max-w-3xl" key={item.question}>
                    <dt className="font-medium">{item.question}</dt>
                    <dd className="mt-2 text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        <Footer />
      </main>
    </>
  );
}

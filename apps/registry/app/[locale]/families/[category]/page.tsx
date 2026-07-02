import { Breadcrumb, Sidebar } from "@vllnt/ui";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { Footer } from "@/components/footer/footer";
import { type Locale, routing } from "@/i18n/routing";
import { getFamilyCopy } from "@/lib/family-copy";
import { getFamilyGroups } from "@/lib/family-groups";
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
  const t = await getTranslations("pages.families");
  const common = await getTranslations("common");

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
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <Breadcrumb
              className="mb-6 text-muted-foreground"
              items={[
                { href: localizePathname("/", locale), label: common("home") },
                {
                  href: localizePathname("/components", locale),
                  label: common("components"),
                },
                { label: group.label },
              ]}
            />
            <p className="text-sm font-medium text-muted-foreground">
              VLLNT UI · {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              {t("familyTitle", { label: group.label })}
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
                {t("browseAll")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
                href={localizePathname("/docs/agents", locale)}
              >
                {t("agentsDocs")}
              </Link>
              <span className="text-sm text-muted-foreground">
                {t("componentCount", { count: group.items.length })}
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
              {t("agentEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{t("agentTitle")}</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {t("agentDescription")}
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
                  {t("llmsDescription")}
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
                  {t("llmsFullDescription")}
                </p>
              </a>
              <Link
                className="rounded-lg border border-border p-5 hover:border-foreground/40"
                href={localizePathname("/docs/agents", locale)}
              >
                <p className="font-mono text-sm">{"/r/<name>.json"}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("registryJsonDescription")}
                </p>
              </Link>
            </div>
          </div>
        </section>

        {copy && copy.faq.length > 0 ? (
          <section>
            <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
              <h2 className="text-2xl font-semibold">{t("faqTitle")}</h2>
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

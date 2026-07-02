import { ShareSection, Sidebar } from "@vllnt/ui";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BadgeSnippets } from "@/components/badge-snippets";
import { Link, type Locale } from "@/i18n/routing";
import { jsonLdScriptAttributes, softwareApplicationLd } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { withRef } from "@/lib/share";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getTemplatePath, TEMPLATES } from "@/lib/templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

const title = "Templates - VLLNT UI";
const description =
  "Starter kits for Next.js apps, dashboards, SaaS products, AI chat, and documentation sites built with VLLNT UI.";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical("/templates", locale),
      languages: languageAlternates("/templates"),
    },
    description,
    openGraph: generateOGMetadata(
      {
        description,
        title,
        type: "docs",
      },
      { locale, pathname: "/templates" },
    ),
    title,
    twitter: generateTwitterMetadata({
      description,
      title,
      type: "docs",
    }),
  };
}

export default async function TemplatesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.templates" });

  return (
    <>
      <Script
        id="templates-json-ld"
        {...jsonLdScriptAttributes(
          TEMPLATES.map((template) =>
            softwareApplicationLd({
              description: template.description,
              name: template.title,
              url: `${SITE_URL}${getTemplatePath(template)}`,
            }),
          ),
        )}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 text-4xl font-semibold">{t("title")}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <ul className="mt-12 grid gap-5 lg:grid-cols-2">
            {TEMPLATES.map((template) => (
              <li
                className="overflow-hidden rounded-md border border-border bg-card"
                key={template.slug}
              >
                <Link className="group block" href={getTemplatePath(template)}>
                  <div className="border-b border-border bg-muted/30">
                    <Image
                      alt={t("screenshotAlt", { name: template.title })}
                      className="aspect-video w-full object-cover"
                      height={720}
                      src={template.screenshot}
                      width={1280}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold">
                          {template.title}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          {t("pages")}
                        </dt>
                        <dd className="mt-1 font-medium">
                          {template.pages.length}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          {t("components")}
                        </dt>
                        <dd className="mt-1 font-medium">
                          {template.components.length}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          {t("stack")}
                        </dt>
                        <dd className="mt-1 font-medium">
                          {template.stack[0]}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <BadgeSnippets />

          <ShareSection
            shareOn={t("shareOn")}
            shareTitle={t("shareTitle")}
            title={t("shareCardTitle")}
            url={withRef(canonical("/templates", locale), "share")}
          />
        </div>
      </main>
    </>
  );
}

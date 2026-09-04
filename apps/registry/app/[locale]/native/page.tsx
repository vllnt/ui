import { Badge } from "@vllnt/ui";
import { Accessibility, Boxes, FlaskConical, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlatformSidebar } from "@/components/platform-sidebar";
import { Link, type Locale } from "@/i18n/routing";
import { jsonLdScriptAttributes, softwareApplicationLd } from "@/lib/jsonld";
import { nativeRegistry } from "@/lib/native-registry";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { type PlatformQuery, withPlatformQuery } from "@/lib/platform";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
  readonly searchParams: Promise<PlatformQuery>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.native" });
  return {
    alternates: {
      canonical: canonical("/native", locale),
      languages: languageAlternates("/native"),
    },
    description: t("metaDescription"),
    openGraph: generateOGMetadata(
      {
        description: t("metaDescription"),
        title: t("metaTitle"),
        type: "page",
      },
      { locale, pathname: "/native" },
    ),
    title: t("metaTitle"),
    twitter: generateTwitterMetadata({
      description: t("metaDescription"),
      title: t("metaTitle"),
      type: "page",
    }),
  };
}

export default async function NativePage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.native" });
  const facts = [
    [t("statusLabel"), t("statusValue")],
    [t("availabilityLabel"), t("availabilityValue")],
    [t("componentsLabel"), String(nativeRegistry.components.length)],
    [t("requirementsLabel"), t("requirementsValue")],
  ];
  const principles = [
    {
      description: t("contractDescription"),
      icon: Boxes,
      title: t("contractTitle"),
    },
    {
      description: t("accessibilityDescription"),
      icon: Accessibility,
      title: t("accessibilityTitle"),
    },
    {
      description: t("releaseDescription"),
      icon: FlaskConical,
      title: t("releaseTitle"),
    },
  ];

  return (
    <>
      <script
        {...jsonLdScriptAttributes(
          softwareApplicationLd({
            description: t("metaDescription"),
            name: "@vllnt/ui-native",
            operatingSystem: ["Android", "iOS"],
            softwareRequirements: t("requirementsValue"),
            url: canonical("/native", locale),
          }),
        )}
      />
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <section className="border-b border-border pb-12">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Smartphone aria-hidden="true" className="size-4" />
              <span>{t("eyebrow")}</span>
            </div>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              {t("description")}
            </p>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-5">
              <Badge variant="secondary">{t("availabilityValue")}</Badge>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {t("sourceNotice")}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={withPlatformQuery("/components", query, "native")}
              >
                {t("browseComponents")}
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={withPlatformQuery("/docs/native", query, "native")}
              >
                {t("readGuide")}
              </Link>
              <a
                className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/r/native/registry.json"
              >
                {t("viewManifest")}
              </a>
            </div>
          </section>

          <dl className="grid gap-px border-x border-b border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(([label, value]) => (
              <div className="bg-card p-5" key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-2 font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="py-12">
            <div className="grid gap-4 lg:grid-cols-3">
              {principles.map((principle) => {
                const Icon = principle.icon;
                return (
                  <article
                    className="rounded-lg border border-border bg-card p-6"
                    key={principle.title}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    <h2 className="mt-5 text-xl font-semibold">
                      {principle.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {principle.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{t("installTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("installDescription")}
            </p>
            <code className="mt-4 block overflow-x-auto rounded-md border border-dashed border-border bg-muted/30 p-4 font-mono text-sm text-muted-foreground">
              {nativeRegistry.installation.command}
            </code>
          </section>
        </div>
      </main>
    </>
  );
}

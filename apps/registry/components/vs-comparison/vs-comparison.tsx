import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import { PageShell } from "@/components/page-shell";
import { Link, type Locale } from "@/i18n/routing";
import { breadcrumbTrailLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/og";
import { getSidebarSections } from "@/lib/sidebar-sections";

type VsComparisonConfig = {
  /** Call-to-action link below the table. */
  readonly cta: { readonly href: string; readonly labelKey: string };
  /** Message namespace holding heading, intro, metadata, and `rows.*`. */
  readonly namespace: string;
  /** Display name of the compared library (table column + breadcrumb). */
  readonly otherName: string;
  readonly pathname: string;
  /** Row keys under `rows.<key>.{attribute,vllnt,other}`, in display order. */
  readonly rowKeys: readonly string[];
};

/** Metadata for a `/vs/<library>` comparison page. */
export async function vsComparisonMetadata(
  { namespace, pathname }: VsComparisonConfig,
  locale: Locale,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  return pageMetadata({
    locale,
    og: {
      description: t("metaDescription"),
      title: t("metaTitle"),
      type: "page",
    },
    pathname,
    title: `${t("metaTitle")} | VLLNT UI`,
  });
}

/** Attribute-by-attribute comparison table of VLLNT UI against one library. */
export async function VsComparisonPage({
  config: { cta, namespace, otherName, pathname, rowKeys },
  locale,
}: {
  readonly config: VsComparisonConfig;
  readonly locale: Locale;
}) {
  setRequestLocale(locale);
  const t = await getTranslations(namespace);

  return (
    <PageShell
      jsonLd={breadcrumbTrailLd(locale, [
        { name: `VLLNT UI vs ${otherName}`, path: pathname },
      ])}
      sections={await getSidebarSections(undefined, locale)}
    >
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          {t("heading")}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">{t("intro")}</p>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 font-medium">{t("colAttribute")}</th>
                <th className="py-3 pr-4 font-medium">VLLNT UI</th>
                <th className="py-3 font-medium">{otherName}</th>
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((key) => (
                <tr className="border-b border-border align-top" key={key}>
                  <td className="py-3 pr-4 font-medium">
                    {t(`rows.${key}.attribute`)}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {t(`rows.${key}.vllnt`)}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {t(`rows.${key}.other`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <Link
            className="inline-flex items-center gap-1 font-medium text-foreground underline"
            href={cta.href}
          >
            {t(cta.labelKey)}
          </Link>
        </div>
      </div>
      <Footer />
    </PageShell>
  );
}

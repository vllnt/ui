import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageShell } from "@/components/page-shell";
import { Link, type Locale } from "@/i18n/routing";
import { breadcrumbTrailLd, collectionPageLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/og";
import { canonical } from "@/lib/seo";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.vs.index" });

  return pageMetadata({
    locale,
    og: {
      description: t("metaDescription"),
      title: t("metaTitle"),
      type: "page",
    },
    pathname: "/vs",
  });
}

const COMPARISONS: readonly {
  readonly available: boolean;
  readonly name: string;
  readonly slug: string;
  readonly taglineKey: string;
}[] = [
  {
    available: true,
    name: "shadcn/ui",
    slug: "shadcn",
    taglineKey: "shadcn",
  },
  {
    available: false,
    name: "Radix UI",
    slug: "radix",
    taglineKey: "radix",
  },
  {
    available: false,
    name: "HeadlessUI",
    slug: "headless-ui",
    taglineKey: "headlessUi",
  },
  {
    available: false,
    name: "NextUI",
    slug: "nextui",
    taglineKey: "nextui",
  },
];

export default async function VsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.vs.index");

  return (
    <PageShell
      jsonLd={[
        breadcrumbTrailLd(locale, [{ name: "Comparisons", path: "/vs" }]),
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
      ]}
      locale={locale}
    >
      <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="text-4xl font-semibold mb-3">{t("title")}</h1>
        <p className="text-muted-foreground text-lg mb-10">{t("intro")}</p>

        <ul className="space-y-3">
          {COMPARISONS.map((entry) =>
            entry.available ? (
              <li key={entry.slug}>
                <Link
                  className="block rounded-lg border border-border p-5 hover:border-foreground/40"
                  href={`/vs/${entry.slug}`}
                >
                  <p className="text-lg font-semibold">
                    {t("cardTitle", { name: entry.name })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`taglines.${entry.taglineKey}`)}
                  </p>
                </Link>
              </li>
            ) : (
              <li
                className="rounded-lg border border-dashed border-border p-5 opacity-60"
                key={entry.slug}
              >
                <p className="text-lg font-semibold">
                  {t("cardTitle", { name: entry.name })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`taglines.${entry.taglineKey}`)}. {t("comingSoon")}
                </p>
              </li>
            ),
          )}
        </ul>
      </div>
    </PageShell>
  );
}

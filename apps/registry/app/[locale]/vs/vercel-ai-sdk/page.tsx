import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import { Link, type Locale } from "@/i18n/routing";
import { breadcrumbTrailLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const PATHNAME = "/vs/vercel-ai-sdk";

const ROW_KEYS: readonly string[] = [
  "whatItIs",
  "primaryJob",
  "componentBreadth",
  "ownSource",
  "agentRegistry",
  "bestTogether",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.vs.vercelAiSdk",
  });
  const ogParameters = {
    description: t("metaDescription"),
    title: t("metaTitle"),
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical(PATHNAME, locale),
      languages: languageAlternates(PATHNAME),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: PATHNAME,
    }),
    title: `${t("metaTitle")} | VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function VsVercelAiSdkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.vs.vercelAiSdk");

  return (
    <>
      <script
        {...jsonLdScriptAttributes(
          breadcrumbTrailLd(locale, [
            { name: "VLLNT UI vs Vercel AI SDK", path: PATHNAME },
          ]),
        )}
      />
      <Sidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
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
                  <th className="py-3 font-medium">Vercel AI SDK</th>
                </tr>
              </thead>
              <tbody>
                {ROW_KEYS.map((key) => (
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
              href="/build/ai-chat-ui"
            >
              {t("buildCta")}
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

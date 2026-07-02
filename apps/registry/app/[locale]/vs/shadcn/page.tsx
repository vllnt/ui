import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Link, type Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.vs.shadcn" });
  const ogParameters = {
    description: t("metaDescription"),
    title: t("metaTitle"),
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical("/vs/shadcn", locale),
      languages: languageAlternates("/vs/shadcn"),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: "/vs/shadcn",
    }),
    title: ogParameters.title,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

type RowMeta = {
  readonly key: string;
  readonly winner?: "even" | "shadcn" | "vllnt";
};

const ROWS: readonly RowMeta[] = [
  { key: "componentCount", winner: "vllnt" },
  { key: "installModel", winner: "even" },
  { key: "ownSource", winner: "even" },
  { key: "siblingResolution", winner: "vllnt" },
  { key: "llmsIndex", winner: "vllnt" },
  { key: "mcpServer", winner: "vllnt" },
  { key: "a11ySchema", winner: "vllnt" },
  { key: "examplesJson", winner: "vllnt" },
  { key: "propsSchema", winner: "vllnt" },
  { key: "versionStability", winner: "vllnt" },
  { key: "theming", winner: "vllnt" },
  { key: "a11yPrimitives", winner: "even" },
  { key: "variantSystem", winner: "even" },
  { key: "communitySize", winner: "shadcn" },
  { key: "namespaceRecognition", winner: "shadcn" },
  { key: "tutorials", winner: "shadcn" },
  { key: "templates", winner: "even" },
  { key: "license", winner: "even" },
];

const codeChunk = (chunks: ReactNode) => <code>{chunks}</code>;
const strongChunk = (chunks: ReactNode) => <strong>{chunks}</strong>;
const templatesLinkChunk = (chunks: ReactNode) => (
  <Link href="/templates">{chunks}</Link>
);

export default async function VsShadcnPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.vs.shadcn");
  const componentCount = getComponentCount();
  const version = getLibraryVersion();

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            {t("eyebrow", { version })}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">{t("title")}</h1>

          <div className="prose prose-lg dark:prose-invert mt-6 max-w-none">
            <h2>{t("tldrHeading")}</h2>
            <p>{t.rich("tldr1", { code: codeChunk })}</p>
            <p>{t("tldr2")}</p>
            <p>{t.rich("tldr3", { link: templatesLinkChunk })}</p>
          </div>

          <h2 className="mt-12 text-2xl font-semibold">{t("sideBySide")}</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold">
                    {t("colAttribute")}
                  </th>
                  <th className="p-3 text-left font-semibold">VLLNT UI</th>
                  <th className="p-3 text-left font-semibold">shadcn/ui</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr className="border-t border-border" key={row.key}>
                    <td className="p-3 font-medium">
                      {t(`rows.${row.key}.attribute`)}
                    </td>
                    <td
                      className={
                        row.winner === "vllnt" ? "p-3 font-semibold" : "p-3"
                      }
                    >
                      {t(`rows.${row.key}.vllnt`, { count: componentCount })}
                    </td>
                    <td
                      className={
                        row.winner === "shadcn" ? "p-3 font-semibold" : "p-3"
                      }
                    >
                      {t(`rows.${row.key}.shadcn`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prose prose-lg dark:prose-invert mt-12 max-w-none">
            <h2>{t("whenHeading")}</h2>
            <p>{t.rich("when1", { strong: strongChunk })}</p>
            <p>{t.rich("when2", { strong: strongChunk })}</p>
            <p>{t("when3")}</p>
          </div>
        </div>
      </main>
    </>
  );
}

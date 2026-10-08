import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link, type Locale } from "@/i18n/routing";
import { getGuides } from "@/lib/content-routes";
import { canonical, languageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  return {
    alternates: {
      canonical: canonical("/guides", locale),
      languages: languageAlternates("/guides"),
    },
    description: t("description"),
    title: t("title"),
  };
}

export default async function GuidesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides");
  const guides = await getGuides(locale);
  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-4 text-4xl font-semibold">{t("title")}</h1>
        <p className="mb-8 text-lg text-muted-foreground">{t("description")}</p>
        <ul className="flex flex-col gap-y-8">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <h2 className="mb-2 text-2xl font-semibold">
                <Link
                  className="text-primary underline underline-offset-4"
                  href={`/guides/${guide.slug}`}
                >
                  {guide.title}
                </Link>
              </h2>
              <p className="text-muted-foreground">{guide.description}</p>
            </li>
          ))}
        </ul>
        <Link
          className="mt-8 inline-block text-primary underline underline-offset-4"
          href="/docs/installation"
        >
          {t("installation")}
        </Link>
      </div>
    </main>
  );
}

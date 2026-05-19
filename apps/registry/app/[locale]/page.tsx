import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Landing } from "@/components/landing/landing";
import type { Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const componentCount = getComponentCount();
  const version = getLibraryVersion();
  const { frontmatter } = await getPageContent("home", locale);
  const og = frontmatter.og;
  const title = frontmatter.title
    .replace("{count}", String(componentCount))
    .replace("{version}", version);
  const description = frontmatter.description
    .replace("{count}", String(componentCount))
    .replace("{version}", version);

  return {
    alternates: {
      canonical: canonical("/", locale),
      languages: languageAlternates("/"),
    },
    description,
    openGraph: generateOGMetadata(
      {
        description: og?.description ?? description,
        title: og?.title ?? title,
        type: og?.type ?? "home",
      },
      { locale, pathname: "/" },
    ),
    title,
    twitter: generateTwitterMetadata({
      description,
      title,
      type: "home",
    }),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <Landing />
      </main>
    </>
  );
}

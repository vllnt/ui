import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import { Landing } from "@/components/landing/landing";
import type { Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";
import { resolveLocaleParams } from "@/lib/locale";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const componentCount = getComponentCount();
  const version = getLibraryVersion();
  const title = "VLLNT UI — UI components & design system for AI agents";
  const description = `Open-source React components for building AI apps: chat, streaming text, tool calls, citations, agent activity, and artifacts. ${componentCount} accessible components, readable by AI agents via llms.txt + JSON. Install with the shadcn CLI. v${version}, MIT.`;

  return {
    alternates: {
      canonical: canonical("/", locale),
      languages: languageAlternates("/"),
    },
    description,
    openGraph: generateOGMetadata(
      { description, title, type: "home" },
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
  const { locale } = await resolveLocaleParams(params);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <Landing />
      </main>
    </>
  );
}

import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Landing } from "@/components/landing/landing";
import type { Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const componentCount = getComponentCount();
  const version = getLibraryVersion();
  const title = `VLLNT UI — ${componentCount} agent-first React components`;
  const description = `Install any of ${componentCount} accessible React components with the shadcn CLI. Built on Radix UI, Tailwind CSS, and CVA. Every component is a machine-readable JSON descriptor agents can consume directly. v${version}, MIT licensed.`;

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

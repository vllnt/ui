import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import type { Locale } from "@/i18n/routing";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { RequestComponentForm } from "./request-component-form";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { resolveLocaleParams } from "@/lib/locale";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical("/request-component", locale),
      languages: languageAlternates("/request-component"),
    },
    description:
      "Request a new VLLNT UI component. The form opens a prefilled GitHub issue — no backend.",
    openGraph: generateOGMetadata(
      { description: "Request a new VLLNT UI component. The form opens a prefilled GitHub issue — no backend.", title: "Request a component · VLLNT UI" },
      { locale, pathname: "/request-component" },
    ),
    robots: { follow: true, index: false },
    title: "Request a component · VLLNT UI",
    twitter: generateTwitterMetadata({
      description: "Request a new VLLNT UI component. The form opens a prefilled GitHub issue — no backend.",
      title: "Request a component · VLLNT UI",
    }),
  };
}

export default async function RequestComponentPage({ params }: Props) {
  const { locale } = await resolveLocaleParams(params);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">Request a component</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Don&rsquo;t see what you need? Fill out the fields and we&rsquo;ll
            open a prefilled GitHub issue with the right labels and template.
          </p>
          <RequestComponentForm />
        </div>
      </main>
    </>
  );
}

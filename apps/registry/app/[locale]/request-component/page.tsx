import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import type { Locale } from "@/i18n/routing";
import { resolveLocaleParameters } from "@/lib/locale";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { RequestComponentForm } from "./request-component-form";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const ogParameters = {
    description:
      "Request a new VLLNT UI component. The form opens a prefilled GitHub issue — no backend.",
    title: "Request a component",
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical("/request-component", locale),
      languages: languageAlternates("/request-component"),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: "/request-component",
    }),
    robots: { follow: true, index: false },
    title: "Request a component · VLLNT UI",
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function RequestComponentPage({ params }: Props) {
  const { locale } = await resolveLocaleParameters(params);

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

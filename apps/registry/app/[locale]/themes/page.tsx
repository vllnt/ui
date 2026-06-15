import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import { ThemeEditor } from "@/components/theme-editor";
import type { Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { resolveLocaleParams } from "@/lib/locale";

const TITLE = "Theme Generator";
const DESCRIPTION =
  "Design a custom VLLNT UI theme in OKLCH — tweak colors and radius, preview live, then export as CSS, a shadcn CLI command, or design tokens.";

export const dynamic = "force-static";
export const revalidate = 86_400;

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical("/themes", locale),
      languages: languageAlternates("/themes"),
    },
    description: DESCRIPTION,
    openGraph: generateOGMetadata(
      { description: DESCRIPTION, title: TITLE, type: "page" },
      { locale, pathname: "/themes" },
    ),
    title: TITLE,
    twitter: generateTwitterMetadata({
      description: DESCRIPTION,
      title: TITLE,
      type: "page",
    }),
  };
}

export default async function ThemesPage({ params }: Props) {
  const { locale } = await resolveLocaleParams(params);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="mb-8 border-b border-border pb-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Theme generator
            </p>
            <h1 className="text-4xl font-semibold">Create a theme</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Customize the OKLCH color tokens and radius, preview the change on
              real components, then export the theme as a CSS variables block, a{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                npx shadcn add
              </code>{" "}
              command, or design tokens. Your theme is saved to the URL so you
              can share it.
            </p>
          </div>
          <ThemeEditor />
        </div>
      </main>
    </>
  );
}

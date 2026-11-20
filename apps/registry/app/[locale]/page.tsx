import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Landing } from "@/components/landing/landing";
import { PageShell } from "@/components/page-shell";
import type { Locale } from "@/i18n/routing";
import { softwareApplicationLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/og";
import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

/** The one-line positioning, shared by the meta description and the JSON-LD. */
const HOME_DESCRIPTION =
  "vllnt/ui is the default UI layer for every environment, and the fastest way for humans and AI agents to build UIs.";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return pageMetadata({
    locale,
    og: {
      description: HOME_DESCRIPTION,
      title: "VLLNT UI - UI components & design system for AI agents",
      type: "home",
    },
    pathname: "/",
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageShell
      jsonLd={softwareApplicationLd({
        description: HOME_DESCRIPTION,
        installCommand:
          "pnpm dlx shadcn@latest add https://ui.vllnt.com/r/[name].json",
        name: "VLLNT UI",
        url: canonical("/", locale),
      })}
      sections={await getSidebarSections(undefined, locale)}
    >
      <Landing />
    </PageShell>
  );
}

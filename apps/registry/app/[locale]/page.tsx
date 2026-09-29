import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Landing } from "@/components/landing/landing";
import { PageShell } from "@/components/page-shell";
import type { Locale } from "@/i18n/routing";
import { softwareApplicationLd } from "@/lib/jsonld";
import { getNpmDistributionTags } from "@/lib/npm-version";
import { pageMetadata } from "@/lib/og";
import { canonical } from "@/lib/seo";
import { getComponentCount } from "@/lib/stats";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const componentCount = getComponentCount();
  const { latest: version } = await getNpmDistributionTags();

  return pageMetadata({
    locale,
    og: {
      description: `Open-source React components for building AI apps: chat, streaming text, tool calls, citations, agent activity, and artifacts. ${componentCount} accessible components, readable by AI agents via llms.txt + JSON. Install with the shadcn CLI. v${version}, MIT.`,
      title: "VLLNT UI — UI components & design system for AI agents",
      type: "home",
    },
    pathname: "/",
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const componentCount = getComponentCount();

  return (
    <PageShell
      jsonLd={softwareApplicationLd({
        description: `Open-source React UI components and design system for building AI apps — ${componentCount} accessible components installable with the shadcn CLI and readable by AI agents via llms.txt.`,
        installCommand:
          "pnpm dlx shadcn@latest add https://ui.vllnt.com/r/[name].json",
        name: "VLLNT UI",
        url: canonical("/", locale),
      })}
      locale={locale}
    >
      <Landing />
    </PageShell>
  );
}

import "@vllnt/ui/styles.css";
import "@vllnt/ui/themes/default.css";
import "@vllnt/ui/themes/presets.css";
import "../globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SidebarProvider, ThemePresetProvider, ThemeProvider } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type React from "react";

import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";
import {
  jsonLdScriptAttributes,
  organizationLd,
  websiteLd,
} from "@/lib/jsonld";
import { alternateOgLocales, languageAlternates, ogLocale } from "@/lib/seo";

type Props = {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requestedLocale } = await params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return {
    alternates: { languages: languageAlternates("/") },
    applicationName: "VLLNT UI",
    authors: [{ name: "VLLNT", url: "https://github.com/vllnt" }],
    category: "Developer Tools",
    creator: "VLLNT",
    description:
      "The UI design system for AI agents and AI-first apps. Open-source React components for AI chat, streaming, tool calls, citations, agents, and artifacts — readable by AI agents via llms.txt. Install with the shadcn CLI.",
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    generator: "Next.js",
    keywords: [
      "ui for ai agents",
      "ai agent ui",
      "ai ui components",
      "ai chat ui",
      "ai chat ui react",
      "generative ui",
      "llm ui components",
      "agent-first ui",
      "design system for ai",
      "ai-first design system",
      "react components",
      "ui library",
      "component library",
      "tailwind",
      "radix-ui",
      "shadcn",
      "registry",
      "design system",
      "accessible",
      "typescript",
      "llms.txt",
      "open source",
    ],
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai",
    ),
    openGraph: {
      alternateLocale: alternateOgLocales(locale),
      locale: ogLocale(locale),
      siteName: "VLLNT UI",
      type: "website",
    },
    publisher: "VLLNT",
    referrer: "origin-when-cross-origin",
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    title: "VLLNT UI — UI components & design system for AI agents",
    twitter: {
      card: "summary_large_image",
      creator: "@vllnt",
      site: "@vllnt",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          href="/rss.xml"
          rel="alternate"
          title="VLLNT UI releases"
          type="application/rss+xml"
        />
        <link
          href="/atom.xml"
          rel="alternate"
          title="VLLNT UI releases"
          type="application/atom+xml"
        />
      </head>
      <body className="h-full overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <ThemePresetProvider />
          <SidebarProvider>
            <div className="flex h-full flex-col overflow-hidden">
              <NextIntlClientProvider>
                <Header locale={locale} />
                <div className="flex flex-1 overflow-hidden">
                  <script
                    {...jsonLdScriptAttributes([organizationLd(), websiteLd()])}
                  />
                  {children}
                </div>
              </NextIntlClientProvider>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

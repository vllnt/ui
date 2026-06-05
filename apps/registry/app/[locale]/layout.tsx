import "@vllnt/ui/styles.css";
import "@vllnt/ui/themes/default.css";
import "../globals.css";

import { SidebarProvider, ThemeProvider } from "@vllnt/ui";
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
      "Agent-first React component registry. 225 accessible components built on Radix UI, Tailwind CSS, and CVA. Install via the shadcn CLI.",
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    generator: "Next.js",
    keywords: [
      "react",
      "components",
      "react components",
      "ui library",
      "component library",
      "tailwind",
      "tailwindcss",
      "radix",
      "radix-ui",
      "shadcn",
      "shadcn-ui",
      "registry",
      "design system",
      "accessible",
      "typescript",
      "ai",
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
    title: "VLLNT UI — 225 agent-first React components",
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
        <script {...jsonLdScriptAttributes(organizationLd())} />
        <script {...jsonLdScriptAttributes(websiteLd())} />
      </head>
      <body className="h-full overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <SidebarProvider>
            <div className="flex h-full flex-col overflow-hidden">
              <NextIntlClientProvider>
                <Header locale={locale} />
                <div className="flex flex-1 overflow-hidden">{children}</div>
              </NextIntlClientProvider>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

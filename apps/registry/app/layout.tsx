import "@vllnt/ui/styles.css";
import "@vllnt/ui/themes/default.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SidebarProvider, ThemeProvider } from "@vllnt/ui";
import type { Metadata } from "next";
import type React from "react";

import { Header } from "@/components/header";

import "./globals.css";

export const metadata: Metadata = {
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
    locale: "en_US",
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

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-full overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <SidebarProvider>
            <div className="flex h-full flex-col overflow-hidden">
              <Header />
              <div className="flex flex-1 overflow-hidden">{children}</div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

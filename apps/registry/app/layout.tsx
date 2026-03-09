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
  description: "VLLNT UI Component Registry",
  title: "VLLNT UI - Component Registry",
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

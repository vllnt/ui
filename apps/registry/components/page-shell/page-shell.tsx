import type { ReactNode } from "react";

import { PlatformSidebar } from "@/components/platform-sidebar";
import type { Locale } from "@/i18n/routing";
import { type JsonLdNode, jsonLdScriptAttributes } from "@/lib/jsonld";
import { getSidebarSections } from "@/lib/sidebar-sections";

/**
 * Standard site page frame: optional JSON-LD script, the platform sidebar, and
 * the scrollable `<main>` region that holds the page content.
 */
export async function PageShell({
  children,
  jsonLd,
  locale,
}: {
  readonly children: ReactNode;
  readonly jsonLd?: JsonLdNode | readonly JsonLdNode[];
  readonly locale: Locale;
}) {
  return (
    <>
      {jsonLd ? <script {...jsonLdScriptAttributes(jsonLd)} /> : null}
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </>
  );
}

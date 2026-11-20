import type { ComponentProps, ReactNode } from "react";

import { PlatformSidebar } from "@/components/platform-sidebar";
import { type JsonLdNode, jsonLdScriptAttributes } from "@/lib/jsonld";

/**
 * Standard site page frame: optional JSON-LD script, the platform sidebar, and
 * the scrollable `<main>` region that holds the page content. Pass
 * `searchable={false}` for a private copy of a page, so the site search lists
 * the public URL alone, and `platform` on a platform variant so its sidebar
 * links carry the platform in the server HTML.
 */
export function PageShell({
  children,
  jsonLd,
  platform,
  searchable = true,
  sections,
}: {
  readonly children: ReactNode;
  readonly jsonLd?: JsonLdNode | readonly JsonLdNode[];
  readonly platform?: ComponentProps<typeof PlatformSidebar>["platform"];
  readonly searchable?: boolean;
  readonly sections: ComponentProps<typeof PlatformSidebar>["sections"];
}) {
  return (
    <>
      {jsonLd ? <script {...jsonLdScriptAttributes(jsonLd)} /> : null}
      <PlatformSidebar platform={platform} sections={sections} />
      <main
        className="flex-1 overflow-y-auto bg-background"
        data-pagefind-ignore={searchable ? undefined : ""}
      >
        {children}
      </main>
    </>
  );
}

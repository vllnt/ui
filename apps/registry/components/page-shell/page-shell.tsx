import type { ComponentProps, ReactNode } from "react";

import { PlatformSidebar } from "@/components/platform-sidebar";
import { type JsonLdNode, jsonLdScriptAttributes } from "@/lib/jsonld";

/**
 * Standard site page frame: optional JSON-LD script, the platform sidebar, and
 * the region that holds the page content. The shared site shell owns the
 * page's `<main id="main">` and the footer, so this renders neither. Pass
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
      <div
        className="min-w-0 flex-1 bg-background"
        data-pagefind-ignore={searchable ? undefined : ""}
        data-slot="page-content"
      >
        {children}
      </div>
    </>
  );
}

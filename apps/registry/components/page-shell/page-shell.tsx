import type { ComponentProps, ReactNode } from "react";

import { PlatformSidebar } from "@/components/platform-sidebar";
import { type JsonLdNode, jsonLdScriptAttributes } from "@/lib/jsonld";

/**
 * Standard site page frame: optional JSON-LD script, the platform sidebar, and
 * the scrollable `<main>` region that holds the page content.
 */
export function PageShell({
  children,
  jsonLd,
  sections,
}: {
  readonly children: ReactNode;
  readonly jsonLd?: JsonLdNode | readonly JsonLdNode[];
  readonly sections: ComponentProps<typeof PlatformSidebar>["sections"];
}) {
  return (
    <>
      {jsonLd ? <script {...jsonLdScriptAttributes(jsonLd)} /> : null}
      <PlatformSidebar sections={sections} />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </>
  );
}

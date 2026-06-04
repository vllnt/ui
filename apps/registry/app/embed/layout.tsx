import "@vllnt/ui/styles.css";
import "@vllnt/ui/themes/default.css";
import "../globals.css";

import type { Metadata } from "next";
import type React from "react";

/**
 * Standalone shell for chromeless `/embed/*` previews. Lives outside the
 * `[locale]` segment so embeds are locale-neutral (one canonical embed per
 * component, no i18n duplicate content) and free of the site header/footer.
 */

export const metadata: Metadata = {
  robots: { follow: false, index: false },
};

export default function EmbedLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-transparent">{children}</body>
    </html>
  );
}

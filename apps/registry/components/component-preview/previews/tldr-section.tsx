"use client";

import { TLDRSection } from "@vllnt/ui";

export default function TLDRSectionPreview() {
  return (
    <TLDRSection label="TLDR">
      This is a collapsible section with a loading animation. When you first
      expand it, you&apos;ll see a shimmer effect before the content appears.
    </TLDRSection>
  );
}

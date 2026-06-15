"use client";

import { ShareSection } from "@vllnt/ui";

export default function ShareSectionPreview() {
  return (
    <ShareSection
      platforms={[
        { key: "x", label: "X" },
        { key: "linkedin", label: "LinkedIn" },
      ]}
      shareOn="Share on"
      shareTitle="Share this article"
      title="My Article"
      url="https://example.com/article"
    />
  );
}

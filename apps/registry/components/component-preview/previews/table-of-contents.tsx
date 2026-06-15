"use client";

import { TableOfContents } from "@vllnt/ui";

export default function TableOfContentsPreview() {
  return (
    <TableOfContents
      sections={[
        { id: "intro", title: "Introduction" },
        { id: "setup", title: "Setup" },
        { id: "usage", title: "Usage" },
      ]}
    />
  );
}

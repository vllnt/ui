"use client";

import { Sidebar } from "@vllnt/ui";

export default function SidebarPreview() {
  return (
    <div className="w-64 border rounded-lg overflow-hidden">
      <Sidebar
        sections={[
          {
            items: [
              { href: "/", title: "Introduction" },
              { href: "/install", title: "Installation" },
            ],
            title: "Getting Started",
          },
        ]}
      />
    </div>
  );
}

"use client";

import { Breadcrumb } from "@vllnt/ui";

export default function BreadcrumbPreview() {
  return (
    <Breadcrumb
      items={[
        { href: "/", label: "Home" },
        { href: "/components", label: "Components" },
        { label: "Breadcrumb" },
      ]}
    />
  );
}

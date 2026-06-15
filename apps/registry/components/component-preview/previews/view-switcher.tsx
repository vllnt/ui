"use client";

import { ViewSwitcher } from "@vllnt/ui";

export default function ViewSwitcherPreview() {
  return (
    <ViewSwitcher
      defaultKey="list"
      options={[
        { key: "list", label: "List" },
        { key: "grid", label: "Grid" },
      ]}
      paramName="demo-view"
    />
  );
}

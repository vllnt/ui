"use client";

import * as React from "react";

import { MultiSelect } from "@vllnt/ui";

export default function MultiSelectPreview() {
  return (
    <div className="w-full max-w-sm">
      <MultiSelect
        defaultValue={["react", "vue"]}
        options={[
          { label: "React", value: "react" },
          { label: "Vue", value: "vue" },
          { label: "Svelte", value: "svelte" },
        ]}
        searchable
      />
    </div>
  );
}

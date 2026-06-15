"use client";

import * as React from "react";

import { Combobox } from "@vllnt/ui";

export default function ComboboxPreview() {
  return (
    <div className="w-full max-w-sm">
      <Combobox
        options={[
          { label: "Next.js", value: "next.js" },
          { label: "React", value: "react" },
          { label: "SvelteKit", value: "sveltekit" },
        ]}
        value="react"
      />
    </div>
  );
}

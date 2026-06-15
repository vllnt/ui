"use client";

import * as React from "react";

import { InlineInput } from "@vllnt/ui";

export default function InlineInputPreview() {
  const [value, setValue] = React.useState("Click to edit");
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Click the input to edit:</p>
      <InlineInput
        onChange={setValue}
        onCommit={(v) => {
          setValue(v);
        }}
        value={value}
      />
    </div>
  );
}

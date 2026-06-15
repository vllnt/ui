"use client";

import * as React from "react";

import { TagsInput } from "@vllnt/ui";

export default function TagsInputPreview() {
  return (
    <div className="w-full max-w-sm">
      <TagsInput
        aria-label="Framework tags"
        defaultValue={["React", "Vue"]}
        placeholder="Add a framework"
      />
    </div>
  );
}

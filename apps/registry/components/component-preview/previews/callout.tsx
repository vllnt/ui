"use client";

import { Callout } from "@vllnt/ui";

export default function CalloutPreview() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <Callout variant="info">This is an informational callout.</Callout>
      <Callout variant="warning">This is a warning callout.</Callout>
      <Callout variant="tip">This is a helpful tip.</Callout>
      <Callout variant="danger">This is a danger callout.</Callout>
    </div>
  );
}

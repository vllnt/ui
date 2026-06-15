"use client";

import { Spinner } from "@vllnt/ui";

export default function SpinnerPreview() {
  return (
    <div className="flex gap-4 items-center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  );
}

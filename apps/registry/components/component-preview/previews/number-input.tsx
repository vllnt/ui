"use client";

import { NumberInput } from "@vllnt/ui";

export default function NumberInputPreview() {
  return (
    <div className="w-full max-w-xs">
      <NumberInput defaultValue={2} min={0} />
    </div>
  );
}

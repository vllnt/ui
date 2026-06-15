"use client";

import { NumberTicker } from "@vllnt/ui";

export default function NumberTickerPreview() {
  return (
    <NumberTicker
      className="text-4xl font-semibold"
      duration={0}
      value={12_840}
    />
  );
}

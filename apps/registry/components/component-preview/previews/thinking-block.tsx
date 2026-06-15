"use client";

import { ThinkingBlock } from "@vllnt/ui";

export default function ThinkingBlockPreview() {
  return (
    <ThinkingBlock
      isStreaming={false}
      thinking="Analyzing the request... Let me break this down into key concepts."
    />
  );
}

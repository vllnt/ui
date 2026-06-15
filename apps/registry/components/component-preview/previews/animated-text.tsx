"use client";

import { AnimatedText } from "@vllnt/ui";

export default function AnimatedTextPreview() {
  return (
    <div className="max-w-xl">
      <AnimatedText
        className="text-2xl font-semibold"
        text="Ship motion that still feels like the current system."
      />
    </div>
  );
}

"use client";

import { AspectRatio } from "@vllnt/ui";

export default function AspectRatioPreview() {
  return (
    <div className="w-[200px]">
      <AspectRatio
        className="bg-muted rounded-md flex items-center justify-center"
        ratio={16 / 9}
      >
        <span className="text-sm text-muted-foreground">16:9</span>
      </AspectRatio>
    </div>
  );
}

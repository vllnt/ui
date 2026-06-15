"use client";

import { ScrollArea } from "@vllnt/ui";

export default function ScrollAreaPreview() {
  return (
    <ScrollArea className="h-[150px] w-[200px] rounded-md border p-4">
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div className="text-sm" key={index}>
            Item {index + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

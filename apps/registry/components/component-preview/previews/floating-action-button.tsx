"use client";

import { FloatingActionButton } from "@vllnt/ui";
import { Plus } from "lucide-react";

export default function FloatingActionButtonPreview() {
  return (
    <div className="relative h-24 border rounded-lg bg-muted/30">
      <FloatingActionButton
        aria-label="Add item"
        onClick={() => {
          alert("Clicked!");
        }}
        position="bottom-right"
      >
        <Plus className="size-5" />
      </FloatingActionButton>
    </div>
  );
}

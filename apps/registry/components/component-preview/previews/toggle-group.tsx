"use client";

import { ToggleGroup, ToggleGroupItem } from "@vllnt/ui";
import { Bold, Italic, Underline } from "lucide-react";

export default function ToggleGroupPreview() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

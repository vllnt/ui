"use client";

import * as React from "react";

import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Toggle } from "@vllnt/ui";
import { ChevronsUpDown } from "lucide-react";

export default function CollapsiblePreview() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Collapsible
      className="w-[250px] space-y-2"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <div className="flex items-center justify-between gap-x-4">
        <h4 className="text-sm font-semibold">Collapsible Section</h4>
        <CollapsibleTrigger asChild>
          <Button aria-label="Toggle section" size="sm" variant="ghost">
            <ChevronsUpDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm">Item 1</div>
        <div className="rounded-md border px-4 py-2 text-sm">Item 2</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

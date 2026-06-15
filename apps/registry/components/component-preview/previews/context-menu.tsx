"use client";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@vllnt/ui";

export default function ContextMenuPreview() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[100px] w-[200px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

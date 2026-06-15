"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@vllnt/ui";

export default function ResizablePreview() {
  return (
    <ResizablePanelGroup className="min-h-[100px] max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-4">
          <span className="text-sm">Panel 1</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-4">
          <span className="text-sm">Panel 2</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

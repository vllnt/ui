"use client";

import { SidebarProvider } from "@vllnt/ui";

export default function SidebarProviderPreview() {
  return (
    <SidebarProvider>
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          Manages sidebar state with useSidebar() hook.
        </p>
      </div>
    </SidebarProvider>
  );
}

"use client";

import * as React from "react";

import { Sidebar, SidebarToggle } from "@vllnt/ui";

export default function SidebarTogglePreview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center gap-4">
      <SidebarToggle
        onToggle={() => {
          setOpen(!open);
        }}
        open={open}
      />
      <span className="text-sm text-muted-foreground">
        Sidebar is {open ? "open" : "closed"}
      </span>
    </div>
  );
}

"use client";

import { Menu, X } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";

export type SidebarToggleProps = {
  className?: string;
  /** Called when user clicks the toggle. */
  onToggle: () => void;
  /** Whether the sidebar is open. */
  open: boolean;
};

/** Responsive sidebar toggle button that shows Menu/X icons based on state. */
export function SidebarToggle({
  className,
  onToggle,
  open,
}: SidebarToggleProps) {
  return (
    <>
      {/* Mobile: shows X when open, Menu when closed */}
      <Button
        className={cn("lg:hidden", className)}
        onClick={onToggle}
        size="icon"
        variant="ghost"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
      {/* Desktop: always shows Menu icon */}
      <Button
        className={cn("hidden lg:flex", className)}
        onClick={onToggle}
        size="icon"
        variant="ghost"
      >
        <Menu className="size-5" />
      </Button>
    </>
  );
}

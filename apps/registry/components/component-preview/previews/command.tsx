"use client";

import * as React from "react";

import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@vllnt/ui";

export default function CommandPreview() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={() => {
          setOpen(true);
        }}
        variant="outline"
      >
        Open Command Menu
      </Button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

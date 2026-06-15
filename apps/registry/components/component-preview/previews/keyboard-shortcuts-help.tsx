"use client";

import * as React from "react";

import { Button, KeyboardShortcutsHelp } from "@vllnt/ui";

export default function KeyboardShortcutsHelpPreview() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Show Shortcuts
      </Button>
      <KeyboardShortcutsHelp
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        shortcuts={[
          { description: "Open command palette", keys: ["⌘", "K"] },
          { description: "Close dialog", keys: ["Esc"] },
        ]}
      />
    </div>
  );
}

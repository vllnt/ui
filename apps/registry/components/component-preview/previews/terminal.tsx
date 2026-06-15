"use client";

import { Terminal } from "@vllnt/ui";

export default function TerminalPreview() {
  return (
    <Terminal
      lines={[
        { content: "npm install", type: "command" },
        { content: "Installing dependencies...", type: "output" },
        { content: "Done in 2.3s", type: "output" },
      ]}
    />
  );
}

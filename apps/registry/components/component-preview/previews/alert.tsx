"use client";

import { Alert, AlertDescription, AlertTitle } from "@vllnt/ui";
import { Terminal as TerminalIcon } from "lucide-react";

export default function AlertPreview() {
  return (
    <div className="space-y-4 w-full max-w-md">
      <Alert>
        <TerminalIcon className="size-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components using the CLI.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again.
        </AlertDescription>
      </Alert>
    </div>
  );
}

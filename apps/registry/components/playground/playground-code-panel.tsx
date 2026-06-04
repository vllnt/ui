"use client";

import * as React from "react";

import { track } from "@vercel/analytics";
import { Button, CodeBlock } from "@vllnt/ui";
import { ExternalLink } from "lucide-react";

import { buildCodeSandboxDefinePayload } from "@/lib/codesandbox";
import type { PlaygroundExample } from "@/lib/playground";

type PlaygroundCodePanelProps = {
  componentName: string;
  example: PlaygroundExample;
  packageVersion: string;
  surface: "inline" | "route";
};

const CODESANDBOX_DEFINE_ENDPOINT =
  "https://codesandbox.io/api/v1/sandboxes/define?json=1";

async function createCodeSandboxUrl(
  exampleCode: string,
  packageVersion: string,
): Promise<null | string> {
  const response = await fetch(CODESANDBOX_DEFINE_ENDPOINT, {
    body: JSON.stringify(
      buildCodeSandboxDefinePayload(exampleCode, packageVersion),
    ),
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { sandbox_id?: string };

  return data.sandbox_id ? `https://codesandbox.io/s/${data.sandbox_id}` : null;
}

export function PlaygroundCodePanel({
  componentName,
  example,
  packageVersion,
  surface,
}: PlaygroundCodePanelProps): React.ReactElement {
  const [isOpening, setIsOpening] = React.useState(false);

  const handleOpenInCodeSandbox = React.useCallback(async () => {
    // Open the tab synchronously to stay inside the user-gesture context so the
    // browser does not block the popup while the define request is in flight.
    const sandboxTab = window.open("", "_blank");
    setIsOpening(true);

    try {
      track("playground_open_codesandbox", {
        component: componentName,
        packageVersion,
        surface,
      });

      const sandboxUrl = await createCodeSandboxUrl(
        example.code,
        packageVersion,
      );

      if (sandboxUrl && sandboxTab) {
        sandboxTab.location.href = sandboxUrl;
      } else {
        sandboxTab?.close();
      }
    } catch {
      sandboxTab?.close();
    } finally {
      setIsOpening(false);
    }
  }, [componentName, example.code, packageVersion, surface]);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">{example.title}</p>
          <p className="text-xs text-muted-foreground">{example.description}</p>
        </div>
        <Button
          className="gap-2 self-start sm:self-auto"
          disabled={isOpening}
          onClick={handleOpenInCodeSandbox}
          size="sm"
          variant="outline"
        >
          {isOpening ? "Opening…" : "Open in CodeSandbox"}
          <ExternalLink className="size-3" />
        </Button>
      </div>
      <div className="p-4">
        <CodeBlock language="tsx" showLanguage={true}>
          {example.code}
        </CodeBlock>
      </div>
    </div>
  );
}

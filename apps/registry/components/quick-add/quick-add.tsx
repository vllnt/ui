"use client";

import { useState } from "react";

import { Button } from "@vllnt/ui";
import { Check, Copy, ExternalLink } from "lucide-react";

type QuickAddProps = {
  componentName: string;
};

export function QuickAdd({ componentName }: QuickAddProps) {
  const registryUrl = `https://ui.vllnt.com/r/${componentName}.json`;
  const installCommand = `pnpm dlx shadcn@latest add ${registryUrl}`;
  const v0Url = `https://v0.dev/chat?q=add+component+from+${encodeURIComponent(registryUrl)}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        className="gap-2"
        onClick={handleCopy}
        size="sm"
        variant="outline"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy install command
          </>
        )}
      </Button>
      <Button
        className="gap-2"
        onClick={() => window.open(v0Url, "_blank")}
        size="sm"
        variant="outline"
      >
        Add to v0.dev
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
}

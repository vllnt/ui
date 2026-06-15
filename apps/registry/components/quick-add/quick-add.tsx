"use client";

import { Button, useCopyToClipboard } from "@vllnt/ui";
import { Check, Copy, ExternalLink } from "lucide-react";

type QuickAddProps = {
  componentName: string;
};

export function QuickAdd({ componentName }: QuickAddProps) {
  const registryUrl = `https://ui.vllnt.ai/r/${componentName}.json`;
  const installCommand = `pnpm dlx shadcn@latest add ${registryUrl}`;
  const v0Url = `https://v0.dev/chat?q=add+component+from+${encodeURIComponent(registryUrl)}`;
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    await copy(installCommand);
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
            <Check className="size-3" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-3" />
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
        <ExternalLink className="size-3" />
      </Button>
    </div>
  );
}

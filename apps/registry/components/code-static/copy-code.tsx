"use client";

import { useState } from "react";

import { Button } from "@vllnt/ui";
import { Check, Copy } from "lucide-react";

type CopyCodeProps = {
  value: string;
};

/**
 * Client island: copies `value` to the clipboard so the surrounding code block
 * can stay a zero-JS server component.
 */
export function CopyCode({ value }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button
      aria-label={copied ? "Copied" : "Copy code"}
      className="absolute right-2 top-2 size-8"
      onClick={handleCopy}
      size="icon"
      variant="ghost"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  );
}

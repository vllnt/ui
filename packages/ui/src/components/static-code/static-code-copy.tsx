"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "../button/button";
import { useCopyToClipboard } from "../copy-button/copy-button";

type StaticCodeCopyProps = {
  value: string;
};

/**
 * Client island for copying a server-rendered code block to the clipboard.
 * Keeps the surrounding highlighted code as zero-JS server markup.
 */
export function StaticCodeCopy({ value }: StaticCodeCopyProps) {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    await copy(value);
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

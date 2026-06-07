"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";

import { Button } from "../button/button";

type StaticCodeCopyProps = {
  value: string;
};

/**
 * Client island for copying a server-rendered code block to the clipboard.
 * Keeps the surrounding highlighted code as zero-JS server markup.
 */
export function StaticCodeCopy({ value }: StaticCodeCopyProps) {
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

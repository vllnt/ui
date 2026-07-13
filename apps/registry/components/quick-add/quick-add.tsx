"use client";

import { useState } from "react";

import { Button } from "@vllnt/ui";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

type QuickAddProps = {
  componentName: string;
};

export function QuickAdd({ componentName }: QuickAddProps) {
  const t = useTranslations("shared.quickAdd");
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
            <Check className="size-3" />
            {t("copied")}
          </>
        ) : (
          <>
            <Copy className="size-3" />
            {t("copyInstall")}
          </>
        )}
      </Button>
      <Button
        className="gap-2"
        onClick={() => window.open(v0Url, "_blank")}
        size="sm"
        variant="outline"
      >
        {t("addToV0")}
        <ExternalLink className="size-3" />
      </Button>
    </div>
  );
}

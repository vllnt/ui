"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog/dialog";

export type SharePlatform = {
  buildUrl: (pageUrl: string, pageTitle: string) => string;
  key: string;
  label: string;
};

export type ShareDialogLabels = {
  copied: string;
  copyLink: string;
};

export type ShareDialogProps = {
  /** Function to build the URL for copying (should add UTM params) */
  buildCopyUrl?: (url: string) => string;
  description?: string;
  labels?: ShareDialogLabels;
  onCopy?: () => void;
  onOpenChange?: (open: boolean) => void;
  onShare?: (platformKey: string) => void;
  open?: boolean;
  platforms: SharePlatform[];
  title?: string;
};

function PlatformButton({
  onClick,
  platform,
}: {
  onClick: (key: string) => void;
  platform: SharePlatform;
}) {
  const handleClick = () => {
    onClick(platform.key);
  };

  return (
    <button
      className={cn(
        "w-full rounded-md border border-border bg-background px-4 py-3",
        "text-sm font-medium text-foreground",
        "transition-colors duration-150",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      )}
      onClick={handleClick}
      type="button"
    >
      {platform.label}
    </button>
  );
}

function CopyButton({
  buildCopyUrl,
  labels,
  onCopy,
}: {
  buildCopyUrl?: (url: string) => string;
  labels: ShareDialogLabels;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    const url = buildCopyUrl
      ? buildCopyUrl(window.location.href)
      : window.location.href;
    const text = `${document.title} - ${url}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [buildCopyUrl, onCopy]);

  return (
    <button
      className={cn(
        "col-span-2 w-full rounded-md border px-4 py-3",
        "text-sm font-medium",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        copied
          ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
          : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
      )}
      onClick={handleCopy}
      type="button"
    >
      {copied ? labels.copied : labels.copyLink}
    </button>
  );
}

const defaultLabels: ShareDialogLabels = {
  copied: "Copied!",
  copyLink: "Copy link",
};

export function ShareDialog({
  buildCopyUrl,
  description,
  labels = defaultLabels,
  onCopy,
  onOpenChange,
  onShare,
  open,
  platforms,
  title = "Share",
}: ShareDialogProps) {
  const handlePlatformClick = React.useCallback(
    (key: string) => {
      const platform = platforms.find((p) => p.key === key);
      if (platform) {
        const url = platform.buildUrl(window.location.href, document.title);
        window.open(url, "_blank", "noopener,noreferrer");
        onShare?.(key);
        onOpenChange?.(false);
      }
    },
    [platforms, onShare, onOpenChange],
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {platforms.map((platform) => (
            <PlatformButton
              key={platform.key}
              onClick={handlePlatformClick}
              platform={platform}
            />
          ))}
          <CopyButton
            buildCopyUrl={buildCopyUrl}
            labels={labels}
            onCopy={onCopy}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

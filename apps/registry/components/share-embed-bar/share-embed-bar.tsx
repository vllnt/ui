"use client";

import * as React from "react";

import { track } from "@vercel/analytics";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ShareDialog,
  type ShareDialogPlatform,
} from "@vllnt/ui";
import { Check, Code2, Copy, Link2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { buildEmbedSnippet, withRef } from "@/lib/share";

type ShareEmbedBarProps = {
  pageUrl: string;
  slug: string;
  title: string;
};

const SHARE_PLATFORMS: ShareDialogPlatform[] = [
  {
    buildUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(withRef(url, "share"))}&text=${encodeURIComponent(title)}`,
    key: "x",
    label: "X",
  },
  {
    buildUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(withRef(url, "share"))}`,
    key: "linkedin",
    label: "LinkedIn",
  },
  {
    buildUrl: (url, title) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(withRef(url, "share"))}&title=${encodeURIComponent(title)}`,
    key: "reddit",
    label: "Reddit",
  },
  {
    buildUrl: (url, title) =>
      `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(withRef(url, "share"))}&t=${encodeURIComponent(title)}`,
    key: "hackernews",
    label: "Hacker News",
  },
  {
    buildUrl: (url, title) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${withRef(url, "share")}`)}`,
    key: "bluesky",
    label: "Bluesky",
  },
];

function CopyLinkButton({
  pageUrl,
  slug,
}: {
  pageUrl: string;
  slug: string;
}): React.ReactElement {
  const t = useTranslations("shared.shareEmbed");
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(withRef(pageUrl, "permalink"));
    setCopied(true);
    track("permalink_copy", { component: slug });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [pageUrl, slug]);

  return (
    <Button className="gap-2" onClick={handleCopy} size="sm" variant="outline">
      {copied ? (
        <>
          <Check className="size-3" />
          {t("linkCopied")}
        </>
      ) : (
        <>
          <Link2 className="size-3" />
          {t("copyLink")}
        </>
      )}
    </Button>
  );
}

function EmbedDialog({
  onOpenChange,
  open,
  slug,
  title,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  slug: string;
  title: string;
}): React.ReactElement {
  const t = useTranslations("shared.shareEmbed");
  const [copied, setCopied] = React.useState(false);
  const snippet = React.useMemo(
    () => buildEmbedSnippet(slug, title),
    [slug, title],
  );

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    track("embed_copy", { component: slug });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [slug, snippet]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("embedTitle", { title })}</DialogTitle>
          <DialogDescription>{t("embedDescription")}</DialogDescription>
        </DialogHeader>
        <textarea
          className="h-32 w-full resize-none rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-foreground"
          readOnly
          spellCheck={false}
          value={snippet}
        />
        <Button className="gap-2" onClick={handleCopy} variant="outline">
          {copied ? (
            <>
              <Check className="size-3" />
              {t("copied")}
            </>
          ) : (
            <>
              <Copy className="size-3" />
              {t("copyEmbedCode")}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function ShareEmbedBar({
  pageUrl,
  slug,
  title,
}: ShareEmbedBarProps): React.ReactElement {
  const t = useTranslations("shared.shareEmbed");
  const [shareOpen, setShareOpen] = React.useState(false);
  const [embedOpen, setEmbedOpen] = React.useState(false);

  return (
    <>
      <Button
        className="gap-2"
        onClick={() => {
          setShareOpen(true);
          track("share_open", { component: slug });
        }}
        size="sm"
        variant="outline"
      >
        <Share2 className="size-3" />
        {t("share")}
      </Button>
      <Button
        className="gap-2"
        onClick={() => {
          setEmbedOpen(true);
        }}
        size="sm"
        variant="outline"
      >
        <Code2 className="size-3" />
        {t("embed")}
      </Button>
      <CopyLinkButton pageUrl={pageUrl} slug={slug} />

      <ShareDialog
        buildCopyUrl={(url) => withRef(url, "share")}
        description={t("shareDescription", { title })}
        onOpenChange={setShareOpen}
        onShare={(platform) => {
          track("share_click", { component: slug, platform });
        }}
        open={shareOpen}
        platforms={SHARE_PLATFORMS}
        title={t("shareTitle", { title })}
      />

      <EmbedDialog
        onOpenChange={setEmbedOpen}
        open={embedOpen}
        slug={slug}
        title={title}
      />
    </>
  );
}

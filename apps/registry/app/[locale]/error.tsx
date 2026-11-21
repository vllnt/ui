"use client";

import { useEffect } from "react";

import { Button } from "@vllnt/ui";
import { useTranslations } from "next-intl";

import { recoverFromChunkError } from "@/lib/chunk-reload";

type Props = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

/** Error boundary for every page: one reload for a stale deploy, else a retry. */
export default function PageError({ error, reset }: Props) {
  const t = useTranslations("pages.error");

  useEffect(() => {
    recoverFromChunkError(error);
  }, [error]);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-24 lg:px-8" id="main">
      <h1 className="text-4xl font-semibold">{t("title")}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>{t("retry")}</Button>
        <Button
          onClick={() => {
            window.location.reload();
          }}
          variant="outline"
        >
          {t("reload")}
        </Button>
      </div>
    </main>
  );
}

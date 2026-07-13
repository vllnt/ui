import { Badge } from "@vllnt/ui";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/i18n/routing";
import { type ChangelogEntry, getChangelogEntries } from "@/lib/changelog";
import { getNpmDistributionTags } from "@/lib/npm-version";

const COMING_LIMIT = 5;

const codeChunk = (chunks: ReactNode) => (
  <code className="font-mono text-sm">{chunks}</code>
);

function bulletHeadline(text: string): string {
  const bold = /^\*\*(.+?)\*\*/.exec(text);
  const lead = bold?.[1] ?? text.split(/\s+[:–—-]\s+/)[0] ?? text;
  return lead.replaceAll(/[*`]/g, "").trim();
}

function comingItems(
  entry: ChangelogEntry | undefined,
  limit: number,
): readonly string[] {
  if (!entry) return [];
  return entry.sections
    .flatMap((section) => section.body.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") || line.startsWith("* "))
    .map((line) => bulletHeadline(line.slice(2)))
    .filter((headline) => headline.length > 0)
    .slice(0, limit);
}

/**
 * Homepage "release channels" surface: the latest tagged release (stable) and
 * the current canary build, plus a preview of the unreleased changelog entry so
 * visitors can see what is shipping next. A missing canary or empty changelog
 * hides that detail.
 */
export async function VersionChannels() {
  const t = await getTranslations("landing.channels");
  const [{ canary, latest }, entries] = await Promise.all([
    getNpmDistributionTags(),
    getChangelogEntries({ type: "all" }),
  ]);
  const unreleased = entries.find((entry) => entry.version === "Unreleased");
  const coming = comingItems(unreleased, COMING_LIMIT);

  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t.rich("description", { code: codeChunk })}
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <div className="border border-border bg-background p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t("stable")}</Badge>
              <span className="font-mono text-sm">v{latest}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t.rich("stableDescription", { code: codeChunk })}
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
              href="/releases"
            >
              {t("releaseNotes")}
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <CanaryCard canary={canary} coming={coming} />
        </div>
      </div>
    </section>
  );
}

async function CanaryCard({
  canary,
  coming,
}: {
  canary?: string;
  coming: readonly string[];
}) {
  const t = await getTranslations("landing.channels");
  return (
    <div className="border border-border bg-background p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{t("canary")}</Badge>
        <span className="font-mono text-sm">{canary ?? "—"}</span>
      </div>
      {coming.length > 0 ? (
        <>
          <p className="mt-3 text-sm font-medium">{t("whatsComing")}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {coming.map((item) => (
              <li className="flex gap-2" key={item}>
                <span aria-hidden className="text-muted-foreground/60">
                  –
                </span>
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {t.rich("canaryDescription", { code: codeChunk })}
        </p>
      )}
      <Link
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
        href="/changelog#unreleased"
      >
        {t("viewChangelog")}
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

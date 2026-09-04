import { Badge } from "@vllnt/ui";
import { getTranslations } from "next-intl/server";

import type { ComponentPlatform } from "@/lib/registry";

type PlatformBadgesProps = {
  readonly className?: string;
  readonly platforms: readonly ComponentPlatform[];
};

/** Localized renderer availability badges for component cards and details. */
export async function PlatformBadges({
  className,
  platforms,
}: PlatformBadgesProps) {
  const t = await getTranslations("common");

  return (
    <div
      aria-label={t("platforms")}
      className={className ?? "flex flex-wrap items-center gap-2"}
      role="group"
    >
      <span className="sr-only">{t("platforms")}:</span>
      {platforms.includes("web") ? (
        <Badge variant="outline">{t("platformWeb")}</Badge>
      ) : null}
      {platforms.includes("native") ? (
        <Badge variant="secondary">{t("platformNativeExperimental")}</Badge>
      ) : null}
    </div>
  );
}

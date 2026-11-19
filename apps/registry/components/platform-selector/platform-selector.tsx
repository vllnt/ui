import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { type PlatformContext, withPlatformQuery } from "@/lib/platform";
import type { ComponentPlatform } from "@/lib/registry";

type PlatformSelectorProps = {
  readonly className?: string;
  readonly includeAll?: boolean;
  /** Unlocalized pathname of the page the options link to. */
  readonly pathname: string;
  /** Platform the page shows; `undefined` means the full catalog. */
  readonly platform: PlatformContext;
};

/**
 * Filter for component implementation availability. The links point at the
 * platform variants of the current page, so it renders on prerendered pages.
 */
export async function PlatformSelector({
  className,
  includeAll = false,
  pathname,
  platform,
}: PlatformSelectorProps) {
  const t = await getTranslations("common");
  const allOption: {
    label: string;
    platform: "all" | ComponentPlatform;
  } = { label: t("platformAll"), platform: "all" };
  const rendererOptions: readonly {
    label: string;
    platform: "all" | ComponentPlatform;
  }[] = [
    { label: t("platformWeb"), platform: "web" },
    {
      label: t("platformNative"),
      platform: "native",
    },
  ];
  const options = includeAll
    ? [allOption, ...rendererOptions]
    : rendererOptions;

  return (
    <nav
      aria-label={t("platformSelectorLabel")}
      className={
        className ??
        "flex min-h-11 items-center gap-1 overflow-x-auto rounded-md border border-border bg-background p-1"
      }
    >
      {options.map((option) => {
        const active = option.platform === (platform ?? "all");
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className="inline-flex min-h-11 shrink-0 items-center rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            href={withPlatformQuery(pathname, {}, option.platform)}
            key={option.platform}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";
import { getPlatform, withPlatformQuery } from "@/lib/platform";
import type { ComponentPlatform } from "@/lib/registry";

type PlatformSelectorProps = {
  readonly className?: string;
  readonly includeAll?: boolean;
};

/** URL-backed renderer navigation shared by the global header and catalogs. */
export function PlatformSelector({
  className,
  includeAll = false,
}: PlatformSelectorProps) {
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const t = useTranslations("common");
  const selected = getPlatform(
    searchParameters.get("platform") ?? undefined,
    includeAll ? "all" : "web",
  );
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
        const active = option.platform === (selected ?? "all");
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className="inline-flex min-h-11 shrink-0 items-center rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            href={withPlatformQuery(
              pathname,
              searchParameters,
              option.platform,
            )}
            key={option.platform}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

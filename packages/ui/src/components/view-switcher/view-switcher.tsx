"use client";

import { memo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "../../lib/utils";

type ViewOption = {
  key: string;
  label: string;
};

type ViewSwitcherProps = {
  className?: string;
  defaultKey?: string;
  options: ViewOption[];
  paramName?: string;
};

const ViewSwitcher = memo(function ViewSwitcher({
  className,
  defaultKey,
  options,
  paramName = "view",
}: ViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedDefault = defaultKey ?? options[0]?.key ?? "";
  const currentKey = searchParams.get(paramName) ?? resolvedDefault;

  function handleSelect(key: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (key === resolvedDefault) {
      params.delete(paramName);
    } else {
      params.set(paramName, key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted p-1",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => (
        <button
          aria-selected={currentKey === option.key}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            currentKey === option.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          key={option.key}
          onClick={() => handleSelect(option.key)}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});

ViewSwitcher.displayName = "ViewSwitcher";

export { ViewSwitcher };
export type { ViewOption, ViewSwitcherProps };

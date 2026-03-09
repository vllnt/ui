"use client";

import { memo, Suspense } from "react";

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

function ViewSwitcherInner({
  className,
  defaultKey,
  options,
  paramName: parameterName = "view",
}: ViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParameters = useSearchParams();

  const resolvedDefault = defaultKey ?? options[0]?.key ?? "";
  const currentKey = searchParameters.get(parameterName) ?? resolvedDefault;

  function handleSelect(key: string): void {
    const parameters = new URLSearchParams(searchParameters.toString());
    if (key === resolvedDefault) {
      parameters.delete(parameterName);
    } else {
      parameters.set(parameterName, key);
    }
    const query = parameters.toString();
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
          onClick={() => {
            handleSelect(option.key);
          }}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ViewSwitcherFallback({
  className,
  defaultKey,
  options,
}: ViewSwitcherProps) {
  const resolvedDefault = defaultKey ?? options[0]?.key ?? "";

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
          aria-selected={resolvedDefault === option.key}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            resolvedDefault === option.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          key={option.key}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const ViewSwitcher = memo(function ViewSwitcher(props: ViewSwitcherProps) {
  return (
    <Suspense fallback={<ViewSwitcherFallback {...props} />}>
      <ViewSwitcherInner {...props} />
    </Suspense>
  );
});

ViewSwitcher.displayName = "ViewSwitcher";

export { ViewSwitcher };
export type { ViewOption, ViewSwitcherProps };

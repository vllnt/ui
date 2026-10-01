"use client";

import { memo, Suspense } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { KeyboardEvent } from "react";

import { moveRovingFocus } from "../../../lib/roving-focus";
import { cn } from "../../../lib/utils";

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

type ViewSwitcherListProps = {
  className?: string;
  currentKey: string;
  onSelect?: (key: string) => void;
  options: ViewOption[];
};

function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
  moveRovingFocus(event, '[role="tab"]');
}

/**
 * Tab row shared by the live switcher and its Suspense fallback. Keyboard
 * follows the WAI-ARIA APG tabs pattern with manual activation (selecting a
 * view navigates): one tab stop on the selected view, ArrowLeft / ArrowRight
 * (wrapping), Home and End move focus; Enter or Space selects.
 */
function ViewSwitcherList({
  className,
  currentKey,
  onSelect,
  options,
}: ViewSwitcherListProps) {
  const hasSelection = options.some((option) => option.key === currentKey);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted p-1",
        className,
      )}
      onKeyDown={handleListKeyDown}
      role="tablist"
      tabIndex={-1}
    >
      {options.map((option, index) => {
        const selected = currentKey === option.key;
        return (
          <button
            aria-selected={selected}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            key={option.key}
            onClick={
              onSelect
                ? () => {
                    onSelect(option.key);
                  }
                : undefined
            }
            role="tab"
            tabIndex={selected || (!hasSelection && index === 0) ? 0 : -1}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

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
    <ViewSwitcherList
      className={className}
      currentKey={currentKey}
      onSelect={handleSelect}
      options={options}
    />
  );
}

function ViewSwitcherFallback({
  className,
  defaultKey,
  options,
}: ViewSwitcherProps) {
  const resolvedDefault = defaultKey ?? options[0]?.key ?? "";

  return (
    <ViewSwitcherList
      className={className}
      currentKey={resolvedDefault}
      options={options}
    />
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

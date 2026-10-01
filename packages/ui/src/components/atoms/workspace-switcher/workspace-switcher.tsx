"use client";

import { useMemo, useState } from "react";

import { moveRovingFocus } from "../../../lib/roving-focus";
import { cn } from "../../../lib/utils";

export type WorkspaceOption = {
  description?: string;
  id: string;
  label: string;
};

export type WorkspaceSwitcherProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  workspaces: WorkspaceOption[];
};

/**
 * Segmented radio group for switching workspaces. Keyboard follows the
 * WAI-ARIA APG radio group pattern: one tab stop on the checked workspace;
 * arrow keys move focus and check the next / previous workspace (wrapping).
 */
const WorkspaceSwitcher = ({
  className,
  defaultValue,
  onKeyDown,
  onValueChange,
  ref,
  value,
  workspaces,
  ...props
}: WorkspaceSwitcherProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const fallbackValue = defaultValue ?? workspaces[0]?.id ?? "";
  const [internalValue, setInternalValue] = useState(fallbackValue);
  const currentValue = value ?? internalValue;

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === currentValue),
    [currentValue, workspaces],
  );

  const hasChecked = currentWorkspace !== undefined;

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    moveRovingFocus(event, '[role="radio"]', {
      activate: true,
      orientation: "both",
    });
  }

  function handleSelect(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-full border border-border/70 bg-muted/50 p-1",
        className,
      )}
      onKeyDown={handleKeyDown}
      ref={ref}
      role="radiogroup"
      {...props}
    >
      {workspaces.map((workspace, index) => {
        const isActive = workspace.id === currentValue;
        return (
          <button
            aria-checked={isActive}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            key={workspace.id}
            onClick={() => {
              handleSelect(workspace.id);
            }}
            role="radio"
            tabIndex={isActive || (!hasChecked && index === 0) ? 0 : -1}
            title={workspace.description}
            type="button"
          >
            {workspace.label}
          </button>
        );
      })}
      {currentWorkspace?.description ? (
        <span className="hidden pl-2 pr-1 text-xs text-muted-foreground md:inline">
          {currentWorkspace.description}
        </span>
      ) : null}
    </div>
  );
};

WorkspaceSwitcher.displayName = "WorkspaceSwitcher";

export { WorkspaceSwitcher };

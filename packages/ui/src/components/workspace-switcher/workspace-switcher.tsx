"use client";

import { forwardRef, useMemo, useState } from "react";

import { cn } from "../../lib/utils";

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

const WorkspaceSwitcher = forwardRef<HTMLDivElement, WorkspaceSwitcherProps>(
  (
    { className, defaultValue, onValueChange, value, workspaces, ...props },
    ref,
  ) => {
    const fallbackValue = defaultValue ?? workspaces[0]?.id ?? "";
    const [internalValue, setInternalValue] = useState(fallbackValue);
    const currentValue = value ?? internalValue;

    const currentWorkspace = useMemo(
      () => workspaces.find((workspace) => workspace.id === currentValue),
      [currentValue, workspaces],
    );

    function handleSelect(nextValue: string) {
      if (value === undefined) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    }

    return (
      <div
        className={cn(
          "inline-flex min-w-0 items-center gap-1 rounded-md border border-border bg-background p-1",
          className,
        )}
        ref={ref}
        role="radiogroup"
        {...props}
      >
        {workspaces.map((workspace) => {
          const isActive = workspace.id === currentValue;
          return (
            <button
              aria-checked={isActive}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              key={workspace.id}
              onClick={() => {
                handleSelect(workspace.id);
              }}
              role="radio"
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
  },
);

WorkspaceSwitcher.displayName = "WorkspaceSwitcher";

export { WorkspaceSwitcher };

"use client";

import { useState } from "react";

import { cn } from "../../lib/utils";

export type ChecklistItem = {
  description?: string;
  id: string;
  label: string;
};

type ChecklistItemRowProps = {
  isChecked: boolean;
  item: ChecklistItem;
  onToggle: () => void;
};

function ChecklistItemRow({
  isChecked,
  item,
  onToggle,
}: ChecklistItemRowProps): React.ReactNode {
  return (
    <li>
      <button
        className={cn(
          "w-full flex items-start gap-3 p-2 rounded-md text-left transition-colors hover:bg-muted/50",
          isChecked && "opacity-60",
        )}
        onClick={onToggle}
        type="button"
      >
        {isChecked ? (
          <svg
            className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect
              height="18"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              width="18"
              x="3"
              y="3"
            />
          </svg>
        )}
        <div className="flex-1 min-w-0">
          <span className={cn("text-sm", isChecked && "line-through")}>
            {item.label}
          </span>
          {item.description ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.description}
            </p>
          ) : null}
        </div>
      </button>
    </li>
  );
}

type ChecklistHeaderProps = {
  checked: number;
  progress: number;
  title?: string;
  total: number;
};

function ChecklistHeader({
  checked,
  progress,
  title,
  total,
}: ChecklistHeaderProps): React.ReactNode {
  if (!title) return null;
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold flex items-center gap-2">
        <svg
          className="h-5 w-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        {title}
      </h4>
      <span className="text-xs text-muted-foreground">
        {checked}/{total} ({progress}%)
      </span>
    </div>
  );
}

export type ChecklistProps = {
  className?: string;
  items: ChecklistItem[];
  onComplete?: () => void;
  persistKey?: string;
  title?: string;
};

// eslint-disable-next-line max-lines-per-function -- Complex interactive component with state and localStorage
export function Checklist({
  className,
  items,
  onComplete,
  persistKey,
  title,
}: ChecklistProps): React.ReactNode {
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window !== "undefined" && persistKey) {
      const saved = localStorage.getItem(`checklist:${persistKey}`);
      if (saved) {
        try {
          return new Set(JSON.parse(saved) as string[]);
        } catch {
          /* skip */
        }
      }
    }
    return new Set();
  });

  const toggleItem = (id: string): void => {
    const newChecked = new Set(checked);
    if (newChecked.has(id)) newChecked.delete(id);
    else newChecked.add(id);
    setChecked(newChecked);
    if (persistKey) {
      try {
        localStorage.setItem(
          `checklist:${persistKey}`,
          JSON.stringify([...newChecked]),
        );
      } catch {
        /* skip */
      }
    }
    if (newChecked.size === items.length) {
      onComplete?.();
    }
  };

  const allChecked = checked.size === items.length;
  const progress =
    items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;

  return (
    <div className={cn("my-6 rounded-lg border bg-card p-4", className)}>
      <ChecklistHeader
        checked={checked.size}
        progress={progress}
        title={title}
        total={items.length}
      />
      <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            allChecked ? "bg-green-500" : "bg-primary",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <ChecklistItemRow
            isChecked={checked.has(item.id)}
            item={item}
            key={item.id}
            onToggle={() => {
              toggleItem(item.id);
            }}
          />
        ))}
      </ul>
      {allChecked ? (
        <div className="mt-4 p-2 rounded bg-green-500/10 text-green-700 dark:text-green-300 text-sm text-center">
          All items completed!
        </div>
      ) : null}
    </div>
  );
}

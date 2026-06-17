"use client";

import * as React from "react";

import { Search, X } from "lucide-react";

import { cn } from "@vllnt/ui";

function useSearchValue(
  value: string | undefined,
  defaultValue: string,
  onValueChange?: (value: string) => void,
) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;

  const setValue = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return [currentValue, setValue] as const;
}

/** Search input with a leading icon and a clear button. */
export type SearchFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "defaultValue" | "onChange" | "type" | "value"
> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      className,
      defaultValue = "",
      onValueChange,
      placeholder = "Search...",
      value,
      ...props
    },
    ref,
  ) => {
    const [currentValue, setValue] = useSearchValue(
      value,
      defaultValue,
      onValueChange,
    );

    return (
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-search-cancel-button]:appearance-none",
            className,
          )}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          placeholder={placeholder}
          ref={ref}
          type="search"
          value={currentValue}
        />
        {currentValue ? (
          <button
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => {
              setValue("");
            }}
            type="button"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchField.displayName = "SearchField";

export { SearchField };

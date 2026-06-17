import * as React from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@vllnt/ui";

/** Styled wrapper around the native `select` element with a chevron. */
export type NativeSelectProps = React.ComponentPropsWithoutRef<"select"> & {
  rootClassName?: string;
};

const NativeSelect = ({
  children,
  className,
  ref,
  rootClassName,
  ...props
}: NativeSelectProps & { ref?: React.Ref<HTMLSelectElement> }) => (
  <div className={cn("relative w-full", rootClassName)}>
    <select
      {...props}
      className={cn(
        "h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50" />
  </div>
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };

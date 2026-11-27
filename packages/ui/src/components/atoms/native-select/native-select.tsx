import * as React from "react";

import { ChevronDown } from "lucide-react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";

/** Styled wrapper around the native `select` element with a chevron. */
export type NativeSelectProps = React.ComponentPropsWithoutRef<"select"> & {
  rootClassName?: string;
};

const NativeSelect = /* @__PURE__ */ named(
  "NativeSelect",
  ({
    children,
    className,
    ref,
    rootClassName,
    ...props
  }: NativeSelectProps & { ref?: React.Ref<HTMLSelectElement> }) => (
    // The chevron sits over the select in one grid cell, not by absolute
    // positioning: a positioned wrapper next to a focused text field joins the
    // caret's compositing layer in Chrome, and text in that layer, here and
    // in what follows it, loses subpixel antialiasing.
    <div className={cn("grid w-full", rootClassName)}>
      <select
        {...props}
        className={cn(
          "h-10 w-full [grid-area:1/1] appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none ml-auto mr-3 size-4 self-center opacity-50 [grid-area:1/1]" />
    </div>
  ),
);

export { NativeSelect };

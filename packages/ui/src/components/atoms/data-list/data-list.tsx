"use client";

import * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

const dataListVariants = cva(
  "grid rounded-xl border bg-card text-card-foreground",
  {
    defaultVariants: {
      density: "default",
    },
    variants: {
      density: {
        compact: "divide-y",
        default: "divide-y",
      },
    },
  },
);

const dataListItemVariants = cva(
  "grid gap-1 p-4 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4 sm:px-5",
  {
    defaultVariants: {
      density: "default",
    },
    variants: {
      density: {
        compact: "py-3",
        default: "py-4",
      },
    },
  },
);

type DataListContextValue = {
  density: NonNullable<VariantProps<typeof dataListVariants>["density"]>;
};

const DataListContext = React.createContext<DataListContextValue>({
  density: "default",
});

export type DataListProps = React.HTMLAttributes<HTMLDListElement> &
  VariantProps<typeof dataListVariants>;

const DataList = /* @__PURE__ */ named(
  "DataList",
  ({
    className,
    density,
    ref: reference,
    ...props
  }: DataListProps & { ref?: React.Ref<HTMLDListElement> }) => {
    const resolvedDensity = density ?? "default";
    const contextValue = React.useMemo<DataListContextValue>(
      () => ({ density: resolvedDensity }),
      [resolvedDensity],
    );

    return (
      <DataListContext.Provider value={contextValue}>
        <dl
          className={cn(
            dataListVariants({ density: resolvedDensity }),
            className,
          )}
          data-slot="data-list"
          ref={reference}
          {...props}
        />
      </DataListContext.Provider>
    );
  },
);

export type DataListItemProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof dataListItemVariants>;

const DataListItem = /* @__PURE__ */ named(
  "DataListItem",
  ({
    className,
    density,
    ref: reference,
    ...props
  }: DataListItemProps & { ref?: React.Ref<HTMLDivElement> }) => {
    const context = React.use(DataListContext);

    return (
      <div
        className={cn(
          dataListItemVariants({ density: density ?? context.density }),
          className,
        )}
        data-slot="data-list-item"
        ref={reference}
        {...props}
      />
    );
  },
);

const DataListLabel = /* @__PURE__ */ named(
  "DataListLabel",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) => (
    <dt
      className={cn("text-sm font-medium text-muted-foreground", className)}
      data-slot="data-list-label"
      ref={reference}
      {...props}
    />
  ),
);

const DataListValue = /* @__PURE__ */ named(
  "DataListValue",
  ({
    className,
    ref: reference,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) => (
    <dd
      className={cn("m-0 text-sm leading-6 text-foreground", className)}
      data-slot="data-list-value"
      ref={reference}
      {...props}
    />
  ),
);

export {
  DataList,
  DataListItem,
  dataListItemVariants,
  DataListLabel,
  DataListValue,
  dataListVariants,
};

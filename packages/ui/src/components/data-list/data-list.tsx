"use client";

import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

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

const DataList = ({
  className,
  density,
  ref: reference,
  ...props
}: DataListProps & React.RefAttributes<HTMLDListElement>) => {
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
        ref={reference}
        {...props}
      />
    </DataListContext.Provider>
  );
};

DataList.displayName = "DataList";

export type DataListItemProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof dataListItemVariants>;

const DataListItem = ({
  className,
  density,
  ref: reference,
  ...props
}: DataListItemProps & React.RefAttributes<HTMLDivElement>) => {
  const context = React.use(DataListContext);

  return (
    <div
      className={cn(
        dataListItemVariants({ density: density ?? context.density }),
        className,
      )}
      ref={reference}
      {...props}
    />
  );
};

DataListItem.displayName = "DataListItem";

const DataListLabel = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>) => (
  <dt
    className={cn("text-sm font-medium text-muted-foreground", className)}
    ref={reference}
    {...props}
  />
);

DataListLabel.displayName = "DataListLabel";

const DataListValue = ({
  className,
  ref: reference,
  ...props
}: React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>) => (
  <dd
    className={cn("m-0 text-sm leading-6 text-foreground", className)}
    ref={reference}
    {...props}
  />
);

DataListValue.displayName = "DataListValue";

export {
  DataList,
  DataListItem,
  dataListItemVariants,
  DataListLabel,
  DataListValue,
  dataListVariants,
};

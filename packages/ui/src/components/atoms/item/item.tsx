import * as React from "react";

import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

const itemVariants = cva("flex items-center gap-3 rounded-md text-sm", {
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default: "p-3",
      sm: "p-2",
    },
    variant: {
      default: "",
      muted: "bg-muted/50",
      outline: "border border-border",
    },
  },
});

/** Flexible row with leading media, content, and trailing actions. */
export type ItemProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof itemVariants>;

const Item = /* @__PURE__ */ named(
  "Item",
  ({
    className,
    ref,
    size,
    variant,
    ...props
  }: ItemProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn(itemVariants({ size, variant }), className)}
      data-slot="item"
      ref={ref}
      {...props}
    />
  ),
);

/** Leading slot for an icon, avatar, or thumbnail. */
export type ItemMediaProps = React.ComponentPropsWithoutRef<"div">;

const ItemMedia = /* @__PURE__ */ named(
  "ItemMedia",
  ({
    className,
    ref,
    ...props
  }: ItemMediaProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center [&_svg]:size-5",
        className,
      )}
      data-slot="item-media"
      ref={ref}
      {...props}
    />
  ),
);

/** Stacked title and description in the middle of an Item. */
export type ItemContentProps = React.ComponentPropsWithoutRef<"div">;

const ItemContent = /* @__PURE__ */ named(
  "ItemContent",
  ({
    className,
    ref,
    ...props
  }: ItemContentProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      data-slot="item-content"
      ref={ref}
      {...props}
    />
  ),
);

/** Primary line of text inside an ItemContent. */
export type ItemTitleProps = React.ComponentPropsWithoutRef<"div">;

const ItemTitle = /* @__PURE__ */ named(
  "ItemTitle",
  ({
    className,
    ref,
    ...props
  }: ItemTitleProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn("font-medium leading-none", className)}
      data-slot="item-title"
      ref={ref}
      {...props}
    />
  ),
);

/** Secondary muted line of text inside an ItemContent. */
export type ItemDescriptionProps = React.ComponentPropsWithoutRef<"p">;

const ItemDescription = /* @__PURE__ */ named(
  "ItemDescription",
  ({
    className,
    ref,
    ...props
  }: ItemDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) => (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="item-description"
      ref={ref}
      {...props}
    />
  ),
);

/** Trailing slot for actions such as buttons or switches. */
export type ItemActionsProps = React.ComponentPropsWithoutRef<"div">;

const ItemActions = /* @__PURE__ */ named(
  "ItemActions",
  ({
    className,
    ref,
    ...props
  }: ItemActionsProps & { ref?: React.Ref<HTMLDivElement> }) => (
    <div
      className={cn("flex shrink-0 items-center gap-2", className)}
      data-slot="item-actions"
      ref={ref}
      {...props}
    />
  ),
);

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  itemVariants,
};

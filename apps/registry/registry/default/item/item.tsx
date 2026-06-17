import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@vllnt/ui";

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

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, size, variant, ...props }, ref) => (
    <div
      className={cn(itemVariants({ size, variant }), className)}
      data-slot="item"
      ref={ref}
      {...props}
    />
  ),
);
Item.displayName = "Item";

/** Leading slot for an icon, avatar, or thumbnail. */
export type ItemMediaProps = React.ComponentPropsWithoutRef<"div">;

const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, ...props }, ref) => (
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
ItemMedia.displayName = "ItemMedia";

/** Stacked title and description in the middle of an Item. */
export type ItemContentProps = React.ComponentPropsWithoutRef<"div">;

const ItemContent = React.forwardRef<HTMLDivElement, ItemContentProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
      data-slot="item-content"
      ref={ref}
      {...props}
    />
  ),
);
ItemContent.displayName = "ItemContent";

/** Primary line of text inside an ItemContent. */
export type ItemTitleProps = React.ComponentPropsWithoutRef<"div">;

const ItemTitle = React.forwardRef<HTMLDivElement, ItemTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("font-medium leading-none", className)}
      data-slot="item-title"
      ref={ref}
      {...props}
    />
  ),
);
ItemTitle.displayName = "ItemTitle";

/** Secondary muted line of text inside an ItemContent. */
export type ItemDescriptionProps = React.ComponentPropsWithoutRef<"p">;

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  ItemDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    data-slot="item-description"
    ref={ref}
    {...props}
  />
));
ItemDescription.displayName = "ItemDescription";

/** Trailing slot for actions such as buttons or switches. */
export type ItemActionsProps = React.ComponentPropsWithoutRef<"div">;

const ItemActions = React.forwardRef<HTMLDivElement, ItemActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex shrink-0 items-center gap-2", className)}
      data-slot="item-actions"
      ref={ref}
      {...props}
    />
  ),
);
ItemActions.displayName = "ItemActions";

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  itemVariants,
};

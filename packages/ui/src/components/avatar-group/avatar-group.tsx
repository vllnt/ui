import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

const avatarGroupVariants = cva("flex items-center", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "-space-x-4",
      md: "-space-x-3",
      sm: "-space-x-2.5",
    },
  },
});

const avatarItemVariants = cva(
  "ring-2 ring-background border border-border bg-muted text-muted-foreground",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "h-12 w-12 text-sm",
        md: "h-10 w-10 text-xs",
        sm: "h-8 w-8 text-[11px]",
      },
    },
  },
);

const overflowBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-medium text-muted-foreground ring-2 ring-background",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "h-12 min-w-12 px-3 text-sm",
        md: "h-10 min-w-10 px-2.5 text-xs",
        sm: "h-8 min-w-8 px-2 text-[11px]",
      },
    },
  },
);

export type AvatarGroupItem = {
  alt: string;
  fallback: string;
  src?: string;
};

export type AvatarGroupProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof avatarGroupVariants> & {
    items: AvatarGroupItem[];
    max?: number;
    overflowLabel?: (hiddenCount: number) => string;
  };

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, items, max, overflowLabel, size, ...props }, reference) => {
    const visibleItems = max === undefined ? items : items.slice(0, max);
    const hiddenCount = max === undefined ? 0 : Math.max(items.length - max, 0);

    return (
      <div
        className={cn(avatarGroupVariants({ size }), className)}
        ref={reference}
        {...props}
      >
        {visibleItems.map((item, index) => (
          <Avatar
            className={avatarItemVariants({ size })}
            key={`${item.alt}-${index}`}
            style={{ zIndex: visibleItems.length - index }}
          >
            {item.src ? <AvatarImage alt={item.alt} src={item.src} /> : null}
            <AvatarFallback>{item.fallback}</AvatarFallback>
          </Avatar>
        ))}
        {hiddenCount > 0 ? (
          <span className={overflowBadgeVariants({ size })}>
            {overflowLabel ? overflowLabel(hiddenCount) : `+${hiddenCount}`}
          </span>
        ) : null}
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup, avatarGroupVariants, avatarItemVariants };

"use client";

import { createContext, use } from "react";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/utils";

const avatarSizeVariants = cva("relative flex shrink-0", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "size-12 text-lg",
      md: "size-10",
      sm: "size-8 text-sm",
      xl: "size-16 text-2xl",
      xs: "size-6 text-xs",
    },
  },
});

const avatarShapeVariants = cva("", {
  defaultVariants: {
    shape: "circle",
  },
  variants: {
    shape: {
      circle: "rounded-full",
      square: "rounded-md",
    },
  },
});

const avatarPresenceVariants = cva(
  "absolute bottom-0 right-0 flex items-center justify-center rounded-full ring-2 ring-background",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      presence: {
        away: "border-2 border-warning bg-background",
        busy: "bg-destructive",
        online: "bg-success",
      },
      size: {
        lg: "size-3.5",
        md: "size-3",
        sm: "size-2.5",
        xl: "size-4",
        xs: "size-2",
      },
    },
  },
);

/**
 * Avatar size. `md` is the default and keeps the original 40 px box.
 *
 * @public
 */
export type AvatarSize = NonNullable<
  VariantProps<typeof avatarSizeVariants>["size"]
>;

/**
 * Avatar outline. `circle` is the default; `square` uses the `md` radius.
 *
 * @public
 */
export type AvatarShape = NonNullable<
  VariantProps<typeof avatarShapeVariants>["shape"]
>;

/**
 * Presence status. Each value draws a different marker shape: `online` is a
 * filled dot, `away` is a ring, `busy` is a dot with a bar.
 *
 * @public
 */
export type AvatarPresence = NonNullable<
  VariantProps<typeof avatarPresenceVariants>["presence"]
>;

/**
 * Props for {@link Avatar}.
 *
 * @public
 */
export type AvatarProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Root
> & {
  /** Status marker drawn at the bottom-right. Omit it for no marker. */
  presence?: AvatarPresence;
  /** Visually hidden status words. Defaults to `Online`, `Away` and `Busy`. */
  presenceLabels?: Partial<Record<AvatarPresence, string>>;
  /** Outline shared by the root, the image and the fallback. Defaults to `circle`. */
  shape?: AvatarShape;
  /** Box size and fallback text size. Defaults to `md` (`size-10`). */
  size?: AvatarSize;
};

const DEFAULT_PRESENCE_LABELS = {
  away: "Away",
  busy: "Busy",
  online: "Online",
} as const satisfies Record<AvatarPresence, string>;

const AvatarShapeContext = createContext<AvatarShape>("circle");

const AvatarPresenceMarker = ({
  label,
  presence,
  size,
}: {
  label: string;
  presence: AvatarPresence;
  size: AvatarSize;
}): React.ReactElement => (
  <span
    className={avatarPresenceVariants({ presence, size })}
    data-presence={presence}
  >
    {presence === "busy" ? (
      <span
        aria-hidden="true"
        className="h-0.5 w-1/2 rounded-full bg-background"
      />
    ) : null}
    <span className="sr-only">{label}</span>
  </span>
);

/**
 * Circular or square user picture container with optional presence marker.
 * Compose it with {@link AvatarImage} and {@link AvatarFallback}.
 *
 * @example
 * ```tsx
 * <Avatar presence="online" size="lg">
 *   <AvatarImage alt="Ada Lovelace" src="/ada.png" />
 *   <AvatarFallback>AL</AvatarFallback>
 * </Avatar>
 * ```
 *
 * @public
 */
const Avatar = ({
  children,
  className,
  presence,
  presenceLabels,
  ref,
  shape = "circle",
  size = "md",
  ...props
}: AvatarProps & {
  ref?: React.Ref<React.ComponentRef<typeof AvatarPrimitive.Root>>;
}) => (
  <AvatarShapeContext value={shape}>
    <AvatarPrimitive.Root
      className={cn(
        avatarSizeVariants({ size }),
        avatarShapeVariants({ shape }),
        presence === undefined && "overflow-hidden",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
      {presence === undefined ? null : (
        <AvatarPresenceMarker
          label={
            presenceLabels?.[presence] ?? DEFAULT_PRESENCE_LABELS[presence]
          }
          presence={presence}
          size={size}
        />
      )}
    </AvatarPrimitive.Root>
  </AvatarShapeContext>
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * Picture shown inside an {@link Avatar}. It renders once the image has loaded
 * and follows the avatar `shape`.
 *
 * @public
 */
const AvatarImage = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
  ref?: React.Ref<React.ComponentRef<typeof AvatarPrimitive.Image>>;
}) => {
  const shape = use(AvatarShapeContext);

  return (
    <AvatarPrimitive.Image
      className={cn(
        "aspect-square h-full w-full",
        avatarShapeVariants({ shape }),
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * Content shown inside an {@link Avatar} while the image is missing or
 * loading: initials, an icon, or any short text. It follows the avatar
 * `shape`.
 *
 * @public
 */
const AvatarFallback = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
  ref?: React.Ref<React.ComponentRef<typeof AvatarPrimitive.Fallback>>;
}) => {
  const shape = use(AvatarShapeContext);

  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted",
        avatarShapeVariants({ shape }),
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };

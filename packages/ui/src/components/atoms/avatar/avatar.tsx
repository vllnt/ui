"use client";

import { createContext, use, useEffect, useMemo, useState } from "react";

import {
  Avatar as AvatarPrimitive,
  AvatarFallback as AvatarFallbackPrimitive,
  AvatarImage as AvatarImagePrimitive,
  type AvatarLoadingStatus,
} from "@ui-sdk/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

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
export type AvatarProps = Omit<
  React.ComponentProps<typeof AvatarPrimitive>,
  "children" | "onLoadingStatusChange"
> & {
  children?: React.ReactNode;
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

type StatusHandler = ((status: AvatarLoadingStatus) => void) | undefined;

type AvatarContextValue = {
  /** Hands the image's `onLoadingStatusChange` to the root, where ui-sdk takes it. */
  setStatusHandler: (handler: StatusHandler) => void;
  shape: AvatarShape;
};

const AvatarContext = createContext<AvatarContextValue>({
  setStatusHandler: () => {
    // No avatar around: nothing listens.
  },
  shape: "circle",
});

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
  ref?: React.Ref<HTMLSpanElement>;
}) => {
  const [statusHandler, setStatusHandler] = useState<StatusHandler>();
  const context = useMemo(() => ({ setStatusHandler, shape }), [shape]);

  return (
    <AvatarContext value={context}>
      <AvatarPrimitive
        className={cn(
          avatarSizeVariants({ size }),
          avatarShapeVariants({ shape }),
          presence === undefined && "overflow-hidden",
          className,
        )}
        onLoadingStatusChange={(status) => {
          statusHandler?.(status);
        }}
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
      </AvatarPrimitive>
    </AvatarContext>
  );
};
Avatar.displayName = "Avatar";

/**
 * Picture shown inside an {@link Avatar}. It renders once the image has loaded
 * and follows the avatar `shape`.
 *
 * @public
 */
const AvatarImage = ({
  className,
  onLoadingStatusChange,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof AvatarImagePrimitive>, "render"> & {
  /** Runs when the image starts loading, loads or fails. */
  onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
  ref?: React.Ref<HTMLImageElement>;
}) => {
  const { setStatusHandler, shape } = use(AvatarContext);

  useEffect(() => {
    // Wrap the function, or React calls it as an updater.
    setStatusHandler(() => onLoadingStatusChange);
    return () => {
      setStatusHandler(undefined);
    };
  }, [setStatusHandler, onLoadingStatusChange]);

  return (
    <AvatarImagePrimitive
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
AvatarImage.displayName = "AvatarImage";

/**
 * Content shown inside an {@link Avatar} while the image is missing or
 * loading: initials, an icon, or any short text. It follows the avatar
 * `shape`.
 *
 * @public
 */
const AvatarFallback = ({
  className,
  delay,
  delayMs,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof AvatarFallbackPrimitive>, "render"> & {
  /** Milliseconds to wait before showing the fallback. Same as `delay`. */
  delayMs?: number;
  ref?: React.Ref<HTMLSpanElement>;
}) => {
  const { shape } = use(AvatarContext);

  return (
    <AvatarFallbackPrimitive
      className={cn(
        "flex h-full w-full items-center justify-center bg-secondary",
        avatarShapeVariants({ shape }),
        className,
      )}
      delay={delayMs ?? delay}
      ref={ref}
      {...props}
    />
  );
};
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };

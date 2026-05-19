"use client";

import {
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@vllnt/ui";

const bannerVariants = cva(
  "flex w-full items-start gap-3 border-b px-4 py-3 text-sm transition-all motion-safe:animate-in motion-safe:slide-in-from-top-1",
  {
    defaultVariants: {
      variant: "info",
    },
    variants: {
      variant: {
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive [&_svg]:text-destructive",
        info: "border-border bg-muted text-foreground [&_svg]:text-muted-foreground",
        success:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-300",
        warning:
          "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-300",
      },
    },
  },
);

/**
 * Visual variant for {@link Banner}. Drives both color treatment and the ARIA
 * role: `warning` and `destructive` render as `role="alert"`, others as
 * `role="status"`.
 *
 * @public
 */
export type BannerVariant = "destructive" | "info" | "success" | "warning";

const URGENT_VARIANTS: ReadonlySet<BannerVariant> = new Set([
  "destructive",
  "warning",
]);

const STORAGE_PREFIX = "vllnt-ui:banner-dismissed:";

function safeStorageGet(key: string): null | string {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function subscribeToStorage(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {
      return;
    };
  }
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
  };
}

function usePersistedDismissed(storageKey: string | undefined): boolean {
  const getClientSnapshot = useCallback(() => {
    if (!storageKey) return false;
    return safeStorageGet(storageKey) === "1";
  }, [storageKey]);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(
    subscribeToStorage,
    getClientSnapshot,
    getServerSnapshot,
  );
}

/**
 * Props for {@link Banner}.
 *
 * @public
 */
export type BannerProps = {
  /** When true, renders a dismiss control. */
  dismissible?: boolean;
  /** Accessible label for the dismiss control. Defaults to `"Dismiss"`. */
  dismissLabel?: string;
  /** Optional icon rendered to the left of the message. */
  icon?: ReactNode;
  /**
   * Stable identifier used as the localStorage key when persisting dismissal.
   * Pair with `persistDismissal` to remember a user's choice.
   */
  id?: string;
  /** Fires after the user clicks the dismiss control. */
  onDismiss?: () => void;
  /**
   * When true alongside `id`, persists dismissal in localStorage so the
   * banner remains hidden across reloads.
   */
  persistDismissal?: boolean;
} & ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof bannerVariants>;

/**
 * Full-width announcement bar.
 *
 * Renders a horizontal bar with variant-driven color treatment, an optional
 * icon slot, and an optional dismiss control. Pair `id` with
 * `persistDismissal` to remember dismissal across sessions in localStorage.
 *
 * @example
 * ```tsx
 * <Banner variant="warning" dismissible icon={<AlertTriangle />}>
 *   Scheduled maintenance tonight at 11pm UTC.
 *   <BannerAction onClick={openStatus}>View status</BannerAction>
 * </Banner>
 * ```
 *
 * @public
 */
export const Banner = ({
  children,
  className,
  dismissible = false,
  dismissLabel = "Dismiss",
  icon,
  id,
  onDismiss,
  persistDismissal = false,
  ref,
  role: roleOverride,
  variant,
  ...rest
}: BannerProps & React.RefAttributes<HTMLDivElement>) => {
  const storageKey =
    persistDismissal && id ? `${STORAGE_PREFIX}${id}` : undefined;
  const persistedDismissed = usePersistedDismissed(storageKey);
  const [locallyDismissed, setLocallyDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setLocallyDismissed(true);
    if (storageKey) safeStorageSet(storageKey, "1");
    onDismiss?.();
  }, [onDismiss, storageKey]);

  if (locallyDismissed || persistedDismissed) return null;

  const resolvedVariant: BannerVariant = variant ?? "info";
  const role =
    roleOverride ?? (URGENT_VARIANTS.has(resolvedVariant) ? "alert" : "status");

  return (
    <div
      className={cn(bannerVariants({ variant }), className)}
      id={id}
      ref={ref}
      role={role}
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
        >
          {icon}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        {children}
      </div>
      {dismissible ? (
        <button
          aria-label={dismissLabel}
          className="ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-md opacity-70 transition-colors hover:bg-foreground/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={handleDismiss}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
};
Banner.displayName = "Banner";

/**
 * Props for {@link BannerAction}.
 *
 * @public
 */
export type BannerActionProps = {
  /** Render the wrapped child element instead of a `<button>`. */
  asChild?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Action slot used inside a {@link Banner} body. Renders a styled button by
 * default, or composes onto a passed child element when `asChild` is true
 * (e.g. wrap an `<a>` for link actions).
 *
 * @public
 */
export const BannerAction = ({
  asChild = false,
  children,
  className,
  ref,
  type,
  ...rest
}: BannerActionProps & React.RefAttributes<HTMLButtonElement>) => {
  const Comp = asChild ? Slot : "button";
  const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = asChild
    ? rest
    : { type: type ?? "button", ...rest };

  return (
    <Comp
      className={cn(
        "inline-flex h-7 items-center justify-center rounded-md border border-foreground/20 bg-transparent px-3 text-xs font-medium underline-offset-4 transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      ref={ref}
      {...buttonProps}
    >
      {children}
    </Comp>
  );
};
BannerAction.displayName = "BannerAction";

export { bannerVariants };

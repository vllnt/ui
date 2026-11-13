"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button, type ButtonProps } from "../../atoms/button/button";

const cookieConsentVariants = cva(
  "fixed z-50 border bg-background transition-all duration-300 motion-reduce:transition-none",
  {
    compoundVariants: [
      {
        class: "bottom-4 left-1/2 -translate-x-1/2 mb-safe",
        layout: "card",
        position: "bottom-center",
      },
      {
        class: "bottom-4 left-4 right-4 sm:right-auto mb-safe ml-safe",
        layout: "card",
        position: "bottom-left",
      },
      {
        class: "bottom-4 right-4 left-4 sm:left-auto mb-safe mr-safe",
        layout: "card",
        position: "bottom-right",
      },
    ],
    defaultVariants: {
      layout: "card",
      position: "bottom-left",
    },
    variants: {
      layout: {
        bar: "inset-x-0 bottom-0 w-full border-x-0 border-b-0 pb-safe",
        card: "max-w-[calc(100vw-2rem)] rounded-lg p-4 shadow-lg sm:px-3 sm:py-1.5",
      },
      position: {
        "bottom-center": "",
        "bottom-left": "",
        "bottom-right": "",
      },
    },
  },
);

/**
 * Localizable strings for {@link CookieConsent}.
 *
 * @public
 */
export type CookieConsentLabels = {
  /** Accessible name of the close button. Defaults to `"Close cookie consent"`. */
  close?: string;
  /** Accessible name of the root dialog when you omit `title`. Defaults to `"Cookie consent"`. */
  region?: string;
};

/**
 * Button treatment for {@link CookieConsent}.
 *
 * - `accept-primary` — accept is the filled primary button, decline is ghost (default).
 * - `equal` — accept and decline are the same outline button at the same size.
 *
 * @public
 */
export type CookieConsentActions = "accept-primary" | "equal";

/**
 * Layout for {@link CookieConsent}.
 *
 * - `card` — floating card placed by `position` (default).
 * - `bar` — full-width band along the bottom edge; `position` does not apply.
 *
 * @public
 */
export type CookieConsentLayout = "bar" | "card";

const DEFAULT_LABELS = {
  close: "Close cookie consent",
  region: "Cookie consent",
} as const satisfies Required<CookieConsentLabels>;

const ACTION_VARIANTS = {
  "accept-primary": { accept: "default", decline: "ghost" },
  equal: { accept: "outline", decline: "outline" },
} as const satisfies Record<
  CookieConsentActions,
  { accept: ButtonProps["variant"]; decline: ButtonProps["variant"] }
>;

/**
 * Props for {@link CookieConsent}.
 *
 * @public
 */
export type CookieConsentProps = {
  /** Text for the accept button */
  acceptText?: string;
  /** Button treatment. Defaults to `"accept-primary"`. */
  actions?: CookieConsentActions;
  /** Text for the decline button (optional, hidden if not provided) */
  declineText?: string;
  /** Localizable strings. */
  labels?: CookieConsentLabels;
  /** Layout. Defaults to `"card"`. */
  layout?: CookieConsentLayout;
  /** Text to display in the banner */
  message?: string;
  /** Called when user accepts */
  onAccept?: () => void;
  /** Called when user declines */
  onDecline?: () => void;
  /** Called when visibility changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the banner is visible */
  open?: boolean;
  /** URL for privacy policy / settings page. Renders the privacy link. */
  settingsHref?: string;
  /** Text for the privacy / settings link */
  settingsText?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Heading shown above the message. When set it also names the dialog. */
  title?: React.ReactNode;
} & VariantProps<typeof cookieConsentVariants> &
  Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title">;

type ConsentActionsProps = {
  acceptText: string;
  actions: CookieConsentActions;
  buttonClassName?: string;
  buttonSize?: ButtonProps["size"];
  declineText?: string;
  linkClassName?: string;
  onAccept: () => void;
  onDecline: () => void;
  settingsHref?: string;
  settingsText: string;
};

function ConsentActions({
  acceptText,
  actions,
  buttonClassName,
  buttonSize,
  declineText,
  linkClassName,
  onAccept,
  onDecline,
  settingsHref,
  settingsText,
}: ConsentActionsProps): React.ReactNode {
  const variants = ACTION_VARIANTS[actions];
  return (
    <>
      {settingsHref ? (
        <a
          className={cn(
            "text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground",
            linkClassName,
          )}
          href={settingsHref}
        >
          {settingsText}
        </a>
      ) : null}
      {declineText ? (
        <Button
          className={buttonClassName}
          onClick={onDecline}
          size={buttonSize}
          type="button"
          variant={variants.decline}
        >
          {declineText}
        </Button>
      ) : null}
      <Button
        className={buttonClassName}
        onClick={onAccept}
        size={buttonSize}
        type="button"
        variant={variants.accept}
      >
        {acceptText}
      </Button>
    </>
  );
}

type ConsentBodyProps = {
  actionProps: Omit<
    ConsentActionsProps,
    "buttonClassName" | "buttonSize" | "linkClassName"
  >;
  heading: React.ReactNode;
  message: string;
};

function CardBody({
  actionProps,
  heading,
  message,
}: ConsentBodyProps): React.ReactNode {
  return (
    <>
      {heading}
      {/* Mobile: stacked layout */}
      <div className="flex flex-col gap-3 sm:hidden">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex items-center gap-2">
          <ConsentActions {...actionProps} buttonSize="sm" />
        </div>
      </div>

      {/* Desktop: single line, all inline */}
      <div className="hidden sm:flex sm:items-center sm:gap-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <ConsentActions
          {...actionProps}
          buttonClassName="h-7 px-3 text-xs"
          linkClassName="whitespace-nowrap"
        />
      </div>
    </>
  );
}

function BarBody({
  actionProps,
  heading,
  message,
  reserveClose,
}: ConsentBodyProps & { reserveClose: boolean }): React.ReactNode {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6",
        reserveClose && "pr-10 md:pr-12",
      )}
    >
      <div className="flex flex-col gap-1">
        {heading}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:gap-3">
        <ConsentActions {...actionProps} />
      </div>
    </div>
  );
}

/**
 * Cookie consent banner component (Vercel-style)
 *
 * A floating card in the bottom-left by default with minimal, clean design.
 * Shows accept button prominently, with optional decline and privacy link.
 * `layout="bar"` renders a full-width band along the bottom edge instead, and
 * `actions="equal"` gives accept and decline the same outline button.
 *
 * A `title` labels the dialog through `aria-labelledby`; without one,
 * `labels.region` labels it through `aria-label`.
 *
 * @example
 * ```tsx
 * <CookieConsent
 *   actions="equal"
 *   acceptText="Accept"
 *   declineText="Decline"
 *   layout="bar"
 *   settingsHref="/privacy"
 *   settingsText="Privacy"
 *   title="Audience measurement"
 * />
 * ```
 *
 * @public
 */
const CookieConsent = ({
  acceptText = "Accept",
  actions = "accept-primary",
  className,
  declineText,
  labels,
  layout = "card",
  message = "This site uses cookies to improve your experience.",
  onAccept,
  onDecline,
  onOpenChange,
  open = true,
  position,
  ref: reference,
  settingsHref,
  settingsText = "Learn more",
  showCloseButton = false,
  title,
  ...props
}: CookieConsentProps & {
  ref?: React.Ref<HTMLDivElement>;
}): React.ReactNode => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const titleId = useId();

  // Handle visibility with animation
  useEffect(() => {
    if (open) {
      // Small delay for mount animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => {
        clearTimeout(timer);
      };
    }
    const rafId = requestAnimationFrame(() => {
      setIsVisible(false);
    });
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [open]);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsAnimatingOut(false);
      onOpenChange?.(false);
    }, 200);
  }, [onOpenChange]);

  const handleAccept = useCallback(() => {
    onAccept?.();
    handleClose();
  }, [onAccept, handleClose]);

  const handleDecline = useCallback(() => {
    onDecline?.();
    handleClose();
  }, [onDecline, handleClose]);

  if (!open && !isAnimatingOut) return null;

  const isBar = layout === "bar";
  const heading = title ? (
    <h2
      className={cn(
        "text-sm font-medium text-foreground",
        !isBar && "mb-2 sm:mb-1",
      )}
      id={titleId}
    >
      {title}
    </h2>
  ) : null;
  const actionProps = {
    acceptText,
    actions,
    declineText,
    onAccept: handleAccept,
    onDecline: handleDecline,
    settingsHref,
    settingsText,
  };

  return (
    <div
      aria-label={
        heading ? undefined : (labels?.region ?? DEFAULT_LABELS.region)
      }
      aria-labelledby={heading ? titleId : undefined}
      aria-live="polite"
      className={cn(
        cookieConsentVariants({ layout, position }),
        // Animation states
        isVisible && !isAnimatingOut
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0",
        className,
      )}
      ref={reference}
      role="dialog"
      {...props}
    >
      {isBar ? (
        <BarBody
          actionProps={actionProps}
          heading={heading}
          message={message}
          reserveClose={showCloseButton}
        />
      ) : (
        <CardBody
          actionProps={actionProps}
          heading={heading}
          message={message}
        />
      )}

      {showCloseButton ? (
        <button
          aria-label={labels?.close ?? DEFAULT_LABELS.close}
          className={cn(
            "absolute rounded-full border bg-background p-1 text-muted-foreground hover:text-foreground",
            isBar ? "right-2 top-2" : "-right-2 -top-2",
          )}
          onClick={handleClose}
          type="button"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
};
CookieConsent.displayName = "CookieConsent";

export { CookieConsent, cookieConsentVariants };

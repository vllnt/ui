"use client";

import { forwardRef, useCallback, useEffect, useReducer, useRef } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { Button, cn, useControllableState } from "@vllnt/ui";

const cookieConsentVariants = cva(
  "fixed z-50 rounded-lg border bg-background shadow-lg transition-all duration-300 max-w-[calc(100vw-2rem)] p-4 sm:py-1.5 sm:px-3",
  {
    defaultVariants: {
      position: "bottom-left",
    },
    variants: {
      position: {
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 mb-safe",
        "bottom-left": "bottom-4 left-4 right-4 sm:right-auto mb-safe ml-safe",
        "bottom-right": "bottom-4 right-4 left-4 sm:left-auto mb-safe mr-safe",
      },
    },
  },
);

type CookieAnimationState = {
  isAnimatingOut: boolean;
  isVisible: boolean;
};

type CookieAnimationAction =
  | { type: "finish-close" }
  | { type: "hide" }
  | { type: "show" }
  | { type: "start-close" };

function cookieAnimationReducer(
  state: CookieAnimationState,
  action: CookieAnimationAction,
): CookieAnimationState {
  switch (action.type) {
    case "finish-close":
      return { ...state, isAnimatingOut: false };
    case "hide":
      return { ...state, isVisible: false };
    case "show":
      return { isAnimatingOut: false, isVisible: true };
    case "start-close":
      return { ...state, isAnimatingOut: true };
  }
}

export type CookieConsentProps = {
  /** Text for the accept button */
  acceptText?: string;
  /** Text for the decline button (optional, hidden if not provided) */
  declineText?: string;
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
  /** URL for privacy policy / settings page */
  settingsHref?: string;
  /** Text for the settings/learn more link */
  settingsText?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
} & VariantProps<typeof cookieConsentVariants> &
  Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

/**
 * Cookie consent banner component (Vercel-style)
 *
 * Positioned in bottom-left by default with minimal, clean design.
 * Shows accept button prominently, with optional decline and settings link.
 */
const CookieConsent = forwardRef<HTMLDivElement, CookieConsentProps>(
  (
    {
      acceptText = "Accept",
      className,
      declineText,
      message = "This site uses cookies to improve your experience.",
      onAccept,
      onDecline,
      onOpenChange,
      open,
      position,
      settingsHref,
      settingsText = "Learn more",
      showCloseButton = false,
      ...props
    },
    reference,
  ) => {
    const [openState, setOpenState] = useControllableState({
      defaultValue: true,
      onChange: onOpenChange,
      value: open,
    });

    const [{ isAnimatingOut, isVisible }, dispatch] = useReducer(
      cookieAnimationReducer,
      {
        isAnimatingOut: false,
        isVisible: false,
      },
    );

    const closeTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

    useEffect(
      () => () => {
        if (closeTimerRef.current !== null) {
          clearTimeout(closeTimerRef.current);
        }
      },
      [],
    );

    useEffect(() => {
      if (openState) {
        const timer = setTimeout(() => {
          dispatch({ type: "show" });
        }, 50);
        return () => {
          clearTimeout(timer);
        };
      }
      const rafId = requestAnimationFrame(() => {
        dispatch({ type: "hide" });
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }, [openState]);

    const handleClose = useCallback(() => {
      dispatch({ type: "start-close" });
      closeTimerRef.current = setTimeout(() => {
        dispatch({ type: "finish-close" });
        setOpenState(false);
      }, 200);
    }, [setOpenState]);

    const handleAccept = useCallback(() => {
      onAccept?.();
      handleClose();
    }, [onAccept, handleClose]);

    const handleDecline = useCallback(() => {
      onDecline?.();
      handleClose();
    }, [onDecline, handleClose]);

    if (!openState && !isAnimatingOut) return null;

    return (
      <div
        aria-label="Cookie consent"
        aria-live="polite"
        className={cn(
          cookieConsentVariants({ position }),
          isVisible && !isAnimatingOut
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0",
          className,
        )}
        ref={reference}
        role="dialog"
        {...props}
      >
        {/* Mobile: stacked layout */}
        <div className="flex flex-col gap-3 sm:hidden">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex items-center gap-2">
            {settingsHref ? (
              <a
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                href={settingsHref}
              >
                {settingsText}
              </a>
            ) : null}
            {declineText ? (
              <Button
                onClick={handleDecline}
                size="sm"
                type="button"
                variant="ghost"
              >
                {declineText}
              </Button>
            ) : null}
            <Button
              onClick={handleAccept}
              size="sm"
              type="button"
              variant="default"
            >
              {acceptText}
            </Button>
          </div>
        </div>

        {/* Desktop: single line, all inline */}
        <div className="hidden sm:flex sm:items-center sm:gap-3">
          <p className="text-sm text-muted-foreground">{message}</p>
          {settingsHref ? (
            <a
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground whitespace-nowrap"
              href={settingsHref}
            >
              {settingsText}
            </a>
          ) : null}
          {declineText ? (
            <Button
              className="h-7 px-3 text-xs"
              onClick={handleDecline}
              type="button"
              variant="ghost"
            >
              {declineText}
            </Button>
          ) : null}
          <Button
            className="h-7 px-3 text-xs"
            onClick={handleAccept}
            type="button"
            variant="default"
          >
            {acceptText}
          </Button>
        </div>

        {showCloseButton ? (
          <button
            aria-label="Close cookie consent"
            className="absolute -right-2 -top-2 rounded-full border bg-background p-1 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
            type="button"
          >
            <X className="size-3" />
          </button>
        ) : null}
      </div>
    );
  },
);
CookieConsent.displayName = "CookieConsent";

export { CookieConsent, cookieConsentVariants };

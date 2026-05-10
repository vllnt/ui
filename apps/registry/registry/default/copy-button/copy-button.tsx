"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Check, Copy } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vllnt/ui";

const FALLBACK_TIMEOUT_MS = 2000;

/**
 * Options for {@link useCopyToClipboard}.
 *
 * @public
 */
export type UseCopyToClipboardOptions = {
  /** Milliseconds the `copied` flag stays true after a successful copy. */
  timeout?: number;
};

/**
 * Return shape for {@link useCopyToClipboard}.
 *
 * @public
 */
export type UseCopyToClipboardResult = {
  /** True for `timeout` ms after the most recent successful copy. */
  copied: boolean;
  /** Writes `value` to the clipboard. Resolves to `true` on success. */
  copy: (value: string) => Promise<boolean>;
  /** Clears the `copied` flag and pending timer. */
  reset: () => void;
};

/**
 * React hook that copies arbitrary strings to the clipboard with a transient
 * `copied` flag suitable for visual feedback.
 *
 * @example
 * ```tsx
 * const { copied, copy } = useCopyToClipboard()
 * <button onClick={() => copy(apiKey)}>{copied ? "Copied!" : "Copy"}</button>
 * ```
 *
 * @public
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardResult {
  const { timeout = FALLBACK_TIMEOUT_MS } = options;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        if (
          typeof navigator === "undefined" ||
          typeof navigator.clipboard?.writeText !== "function"
        ) {
          return false;
        }
        await navigator.clipboard.writeText(value);
        if (timerRef.current !== undefined) clearTimeout(timerRef.current);
        setCopied(true);
        timerRef.current = setTimeout(() => {
          setCopied(false);
        }, timeout);
        return true;
      } catch {
        return false;
      }
    },
    [timeout],
  );

  return { copied, copy, reset };
}

/**
 * Visual variant for {@link CopyButton}.
 *
 * - `icon`   — compact icon-style button (default), suitable for toolbars.
 * - `inline` — small button sized to sit next to short inline text.
 * - `button` — full button with text label, suitable for primary CTAs.
 *
 * @public
 */
export type CopyButtonVariant = "button" | "icon" | "inline";

type ButtonElementProps = ComponentPropsWithoutRef<"button">;

/**
 * Props for {@link CopyButton}.
 *
 * @public
 */
export type CopyButtonProps = {
  /** Tooltip + announcement text after a successful copy. Defaults to `"Copied!"`. */
  copiedLabel?: string;
  /** Class name forwarded to the rendered icon. */
  iconClassName?: string;
  /** Tooltip + accessible label before copy. Defaults to `"Copy"`. */
  label?: string;
  /** Set to `false` to suppress the tooltip. */
  showTooltip?: boolean;
  /** Milliseconds the success state persists. Defaults to 2000. */
  timeout?: number;
  /** String to write to the clipboard when clicked. */
  value: string;
  /** Visual variant. */
  variant?: CopyButtonVariant;
} & Omit<ButtonElementProps, "value">;

function CopyIcon({
  className,
  copied,
  size,
}: {
  className?: string;
  copied: boolean;
  size: "sm" | "xs";
}): ReactNode {
  const Icon = copied ? Check : Copy;
  const sizeClass = size === "xs" ? "h-3 w-3" : "h-4 w-4";
  return <Icon aria-hidden="true" className={cn(sizeClass, className)} />;
}

type TriggerProps = Omit<
  CopyButtonProps,
  "copiedLabel" | "showTooltip" | "timeout"
> & {
  accessibleLabel: string;
  copied: boolean;
  copiedText: string;
  onClickHandler: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

const ButtonTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  (
    {
      accessibleLabel,
      className,
      copied,
      copiedText,
      iconClassName,
      label = "Copy",
      onClick: _onClick,
      onClickHandler,
      value: _value,
      variant = "icon",
      ...rest
    },
    ref,
  ) => {
    if (variant === "button") {
      return (
        <Button
          aria-label={accessibleLabel}
          className={cn(className)}
          onClick={onClickHandler}
          ref={ref}
          size="sm"
          type="button"
          variant="outline"
          {...rest}
        >
          <CopyIcon className={iconClassName} copied={copied} size="sm" />
          <span>{copied ? copiedText : label}</span>
        </Button>
      );
    }

    if (variant === "inline") {
      return (
        <Button
          aria-label={accessibleLabel}
          className={cn(
            "h-6 w-6 align-middle text-muted-foreground hover:text-foreground",
            className,
          )}
          onClick={onClickHandler}
          ref={ref}
          size="icon"
          type="button"
          variant="ghost"
          {...rest}
        >
          <CopyIcon className={iconClassName} copied={copied} size="xs" />
        </Button>
      );
    }

    return (
      <Button
        aria-label={accessibleLabel}
        className={cn("h-8 w-8", className)}
        onClick={onClickHandler}
        ref={ref}
        size="icon"
        type="button"
        variant="ghost"
        {...rest}
      >
        <CopyIcon className={iconClassName} copied={copied} size="sm" />
      </Button>
    );
  },
);
ButtonTrigger.displayName = "CopyButton.Trigger";

/**
 * Click-to-copy button with confirmation feedback.
 *
 * Composes {@link Button} and {@link Tooltip}. Copies `value` to the clipboard
 * via the async Clipboard API and announces success to assistive tech via a
 * visually hidden status region.
 *
 * @example
 * ```tsx
 * <CopyButton value={apiKey} />
 * <CopyButton value={url} variant="button" label="Copy link" />
 * <span>ID: usr_42 <CopyButton value="usr_42" variant="inline" /></span>
 * ```
 *
 * @public
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      "aria-label": ariaLabelOverride,
      copiedLabel = "Copied!",
      label = "Copy",
      onClick,
      showTooltip = true,
      timeout = FALLBACK_TIMEOUT_MS,
      value,
      ...rest
    },
    ref,
  ) => {
    const { copied, copy } = useCopyToClipboard({ timeout });

    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        void copy(value);
      },
      [copy, onClick, value],
    );

    const accessibleLabel = ariaLabelOverride ?? (copied ? copiedLabel : label);
    const tooltipText = copied ? copiedLabel : label;

    const trigger: ReactElement = (
      <ButtonTrigger
        {...rest}
        accessibleLabel={accessibleLabel}
        copied={copied}
        copiedText={copiedLabel}
        label={label}
        onClickHandler={handleClick}
        ref={ref}
        value={value}
      />
    );

    const liveRegion = (
      <span aria-live="polite" className="sr-only" role="status">
        {copied ? copiedLabel : ""}
      </span>
    );

    if (!showTooltip) {
      return (
        <>
          {trigger}
          {liveRegion}
        </>
      );
    }

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>{tooltipText}</TooltipContent>
        </Tooltip>
        {liveRegion}
      </TooltipProvider>
    );
  },
);
CopyButton.displayName = "CopyButton";

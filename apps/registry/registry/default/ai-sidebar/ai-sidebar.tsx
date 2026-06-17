"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Bot, MessageSquarePlus, X } from "lucide-react";

import { useEscapeKey } from "@vllnt/ui";
import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 280;
const MAX_WIDTH = 720;

/**
 * Side of the viewport the sidebar attaches to.
 *
 * @public
 */
export type AISidebarPosition = "left" | "right";

/**
 * Localizable strings for {@link AISidebar} subcomponents.
 *
 * @public
 */
export type AISidebarLabels = {
  /** Aria-label for the close control. Defaults to `"Close assistant"`. */
  close?: string;
  /** Default heading text for {@link AISidebarTitle}. */
  defaultTitle?: string;
  /** Aria-label for the open trigger. Defaults to `"Open AI assistant"`. */
  open?: string;
};

const DEFAULT_LABELS = {
  close: "Close assistant",
  defaultTitle: "AI Assistant",
  open: "Open AI assistant",
} as const satisfies Required<AISidebarLabels>;

type AISidebarContextValue = {
  close: () => void;
  labels: Required<AISidebarLabels>;
  open: () => void;
  openState: boolean;
  position: AISidebarPosition;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  width: number;
};

const NO_OP = (): void => {
  return;
};

const DEFAULT_CONTEXT: AISidebarContextValue = {
  close: NO_OP,
  labels: DEFAULT_LABELS,
  open: NO_OP,
  openState: false,
  position: "right",
  setOpen: NO_OP,
  toggle: NO_OP,
  width: DEFAULT_WIDTH,
};

const AISidebarContext = createContext<AISidebarContextValue>(DEFAULT_CONTEXT);

/**
 * Hook for reading sidebar state from anywhere inside an
 * {@link AISidebarProvider}.
 *
 * @public
 */
export function useAISidebar(): AISidebarContextValue {
  return useContext(AISidebarContext);
}

/**
 * Props for {@link AISidebarProvider}.
 *
 * @public
 */
export type AISidebarProviderProps = {
  children?: ReactNode;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Initial position. Defaults to `"right"`. */
  defaultPosition?: AISidebarPosition;
  /** Initial width in px. Defaults to `400`. */
  defaultWidth?: number;
  /** Localizable strings. */
  labels?: AISidebarLabels;
  /** Fires when the open state changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** Controlled open state. */
  open?: boolean;
};

function clampWidth(value: number): number {
  return Math.min(Math.max(value, MIN_WIDTH), MAX_WIDTH);
}

/**
 * Provider for the AI sidebar context. Wrap your app shell with this so
 * {@link AISidebar}, {@link AISidebarTrigger}, and {@link useAISidebar}
 * share the same state.
 *
 * @public
 */
export function AISidebarProvider({
  children,
  defaultOpen = false,
  defaultPosition = "right",
  defaultWidth = DEFAULT_WIDTH,
  labels,
  onOpenChange,
  open: controlledOpen,
}: AISidebarProviderProps): ReactNode {
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const openState = isControlled ? controlledOpen : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const open = useCallback(() => {
    setOpen(true);
  }, [setOpen]);
  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const toggle = useCallback(() => {
    setOpen(!openState);
  }, [openState, setOpen]);

  const value = useMemo<AISidebarContextValue>(
    () => ({
      close,
      labels: resolvedLabels,
      open,
      openState,
      position: defaultPosition,
      setOpen,
      toggle,
      width: clampWidth(defaultWidth),
    }),
    [
      close,
      defaultPosition,
      defaultWidth,
      open,
      openState,
      resolvedLabels,
      setOpen,
      toggle,
    ],
  );

  return (
    <AISidebarContext.Provider value={value}>
      {children}
    </AISidebarContext.Provider>
  );
}

/**
 * Props for {@link AISidebar}.
 *
 * @public
 */
export type AISidebarProps = {
  /** When true, pressing Escape closes the sidebar. Defaults to `true`. */
  closeOnEscape?: boolean;
} & ComponentPropsWithoutRef<"aside">;

/**
 * Slide-out AI assistant panel anchored to the left or right edge. Renders
 * an `<aside role="complementary">` so screen readers announce it as a
 * complementary region. Sets `aria-hidden` on close so its content is
 * skipped by assistive tech.
 *
 * @example
 * ```tsx
 * <AISidebarProvider defaultOpen={false}>
 *   <AISidebar>
 *     <AISidebarHeader>
 *       <AISidebarTitle>AI Assistant</AISidebarTitle>
 *       <AISidebarClose />
 *     </AISidebarHeader>
 *     <AISidebarContent>{messages}</AISidebarContent>
 *     <AISidebarFooter>{composer}</AISidebarFooter>
 *   </AISidebar>
 *   <AISidebarTrigger />
 *   <main>{children}</main>
 * </AISidebarProvider>
 * ```
 *
 * @public
 */
export const AISidebar = forwardRef<HTMLElement, AISidebarProps>(
  (props, ref) => {
    const { children, className, closeOnEscape = true, ...rest } = props;
    const { close, labels, openState, position, width } = useAISidebar();
    useEscapeKey(close, {
      enabled: closeOnEscape && openState,
      target: "document",
    });

    return (
      <aside
        aria-hidden={!openState}
        aria-label={labels.defaultTitle}
        className={cn(
          "fixed top-0 z-40 flex h-full flex-col border-border bg-background shadow-lg transition-transform duration-200 ease-out",
          position === "right" ? "right-0 border-l" : "left-0 border-r",
          openState
            ? "translate-x-0"
            : position === "right"
              ? "translate-x-full"
              : "-translate-x-full",
          "max-w-full",
          className,
        )}
        data-state={openState ? "open" : "closed"}
        inert={!openState}
        ref={ref}
        style={{ width: `${width.toString()}px` }}
        {...rest}
      >
        {children}
      </aside>
    );
  },
);
AISidebar.displayName = "AISidebar";

/**
 * Header slot for an {@link AISidebar}. Use to host the title, model
 * selector, and the close control.
 *
 * @public
 */
export const AISidebarHeader = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<"header">
>(({ children, className, ...rest }, ref) => (
  <header
    className={cn(
      "flex items-center gap-2 border-b border-border px-4 py-3",
      className,
    )}
    ref={ref}
    {...rest}
  >
    {children}
  </header>
));
AISidebarHeader.displayName = "AISidebarHeader";

/**
 * Title slot for {@link AISidebarHeader}. Defaults to the localized title
 * from the provider whenever the consumer omits children.
 *
 * @public
 */
export const AISidebarTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<"h2">
>(({ children, className, ...rest }, ref) => {
  const { labels } = useAISidebar();
  return (
    <h2
      className={cn(
        "flex flex-1 items-center gap-2 text-sm font-semibold tracking-tight text-foreground",
        className,
      )}
      ref={ref}
      {...rest}
    >
      <Bot aria-hidden="true" className="size-4 text-muted-foreground" />
      {children ?? labels.defaultTitle}
    </h2>
  );
});
AISidebarTitle.displayName = "AISidebarTitle";

/**
 * Close-button slot for {@link AISidebarHeader}.
 *
 * @public
 */
export const AISidebarClose = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "type">
>(({ className, onClick, ...rest }, ref) => {
  const { close, labels } = useAISidebar();
  const handleCloseSidebar = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      close();
    },
    [close, onClick],
  );
  return (
    <Button
      aria-label={labels.close}
      className={cn("size-8", className)}
      onClick={handleCloseSidebar}
      ref={ref}
      size="icon"
      type="button"
      variant="ghost"
      {...rest}
    >
      <X aria-hidden="true" className="size-4" />
    </Button>
  );
});
AISidebarClose.displayName = "AISidebarClose";

/**
 * Scrollable middle section of {@link AISidebar}.
 *
 * @public
 */
export const AISidebarContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, className, ...rest }, ref) => (
  <div
    className={cn("flex flex-1 flex-col gap-2 overflow-y-auto p-4", className)}
    ref={ref}
    {...rest}
  >
    {children}
  </div>
));
AISidebarContent.displayName = "AISidebarContent";

/**
 * Bottom slot of {@link AISidebar}, typically the chat composer.
 *
 * @public
 */
export const AISidebarFooter = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<"footer">
>(({ children, className, ...rest }, ref) => (
  <footer
    className={cn("border-t border-border bg-background px-4 py-3", className)}
    ref={ref}
    {...rest}
  >
    {children}
  </footer>
));
AISidebarFooter.displayName = "AISidebarFooter";

/**
 * Props for {@link AISidebarTrigger}.
 *
 * @public
 */
export type AISidebarTriggerProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "type"
>;

/**
 * Standalone control that opens the sidebar. Place anywhere inside an
 * {@link AISidebarProvider}. Falls back to the default icon + label when
 * the consumer omits children.
 *
 * @public
 */
export const AISidebarTrigger = forwardRef<
  HTMLButtonElement,
  AISidebarTriggerProps
>(({ children, className, onClick, ...rest }, ref) => {
  const { labels, openState, toggle } = useAISidebar();
  const handleToggleSidebar = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      toggle();
    },
    [onClick, toggle],
  );
  return (
    <Button
      aria-expanded={openState}
      aria-label={children ? undefined : labels.open}
      className={cn(className)}
      data-state={openState ? "open" : "closed"}
      onClick={handleToggleSidebar}
      ref={ref}
      size={children ? "sm" : "icon"}
      type="button"
      variant="outline"
      {...rest}
    >
      {children ?? <MessageSquarePlus aria-hidden="true" className="size-4" />}
    </Button>
  );
});
AISidebarTrigger.displayName = "AISidebarTrigger";

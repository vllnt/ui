"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cva } from "class-variance-authority";
import type { KeyboardEvent, ReactNode } from "react";

import { moveRovingFocus } from "../../../lib/roving-focus";
import { cn } from "../../../lib/utils";

/**
 * Look of the tab triggers (Penpot `Style` axis): `underline` is the default,
 * `pill` fills the active trigger, `link` is plain text. Penpot's `segment`
 * style is the `SegmentedControl` component, not a Tabs variant.
 */
export type TabsVariant = "link" | "pill" | "underline";

const tabsListVariants = cva("flex overflow-x-auto", {
  variants: {
    variant: {
      link: "",
      pill: "gap-1",
      underline: "border-b border-border",
    },
  },
});

const tabsTriggerVariants = cva(
  "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
  {
    variants: {
      variant: {
        link: "underline-offset-4 data-[state=active]:text-foreground data-[state=active]:underline data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:underline",
        pill: "rounded-full data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground",
        underline:
          "-mb-px border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:border-muted-foreground/50 data-[state=inactive]:hover:text-foreground",
      },
    },
  },
);

type TabsContextValue = {
  activeTab: string;
  baseId: string;
  firstTab?: string;
  panelIds: ReadonlyMap<string, string>;
  registerPanel: (value: string, id: string) => () => void;
  registerTab: (value: string, id: string) => () => void;
  setActiveTab: (value: string) => void;
  tabIds: ReadonlyMap<string, string>;
  variant: TabsVariant;
};

/**
 * Tracks the element id rendered for each tab value, in mount order, so
 * `aria-controls` / `aria-labelledby` reference rendered nodes and nothing else.
 */
function useIdRegistry(): readonly [
  ReadonlyMap<string, string>,
  (value: string, id: string) => () => void,
] {
  const [ids, setIds] = useState<ReadonlyMap<string, string>>(new Map());
  const register = useCallback((value: string, id: string) => {
    setIds((current) =>
      current.get(value) === id ? current : new Map(current).set(value, id),
    );
    return () => {
      setIds((current) => {
        if (current.get(value) !== id) return current;
        const next = new Map(current);
        next.delete(value);
        return next;
      });
    };
  }, []);
  return [ids, register];
}

function toIdPart(value: string): string {
  return encodeURIComponent(value);
}

const TabsContext = createContext<null | TabsContextValue>(null);

function useTabsContext(): TabsContextValue {
  const context = use(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a Tabs component");
  }
  return context;
}

export type TabsProps = {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  /** Look of the triggers, shared with `Tabs.List` and `Tabs.Trigger`. Defaults to `underline`. */
  variant?: TabsVariant;
};

/**
 * Root of a tabs group. Holds the active value and the `variant` that
 * `Tabs.List` and `Tabs.Trigger` read from context.
 */
function Tabs({
  children,
  className,
  defaultValue = "",
  onValueChange,
  value,
  variant = "underline",
}: TabsProps): React.ReactNode {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalTab;

  // Read the latest `onValueChange` without re-creating the context value.
  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  const handleSetActiveTab = useCallback(
    (next: string): void => {
      if (!isControlled) {
        setInternalTab(next);
      }
      onValueChangeRef.current?.(next);
    },
    [isControlled],
  );

  const baseId = useId();
  const [tabIds, registerTab] = useIdRegistry();
  const [panelIds, registerPanel] = useIdRegistry();
  const [firstTab] = tabIds.keys();

  const contextValue = useMemo(
    () => ({
      activeTab,
      baseId,
      firstTab,
      panelIds,
      registerPanel,
      registerTab,
      setActiveTab: handleSetActiveTab,
      tabIds,
      variant,
    }),
    [
      activeTab,
      baseId,
      firstTab,
      handleSetActiveTab,
      panelIds,
      registerPanel,
      registerTab,
      tabIds,
      variant,
    ],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("my-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = {
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
};

/**
 * Container for the tab triggers. Implements the WAI-ARIA APG tabs keyboard
 * model: ArrowLeft / ArrowRight move focus between tabs (wrapping), Home / End
 * jump to the first / last tab, and the focused tab becomes active. A consumer
 * `onKeyDown` runs first; calling `preventDefault()` in it opts out. Outside a
 * `Tabs` it falls back to the `underline` look.
 */
function TabsList({
  "aria-label": ariaLabel,
  children,
  className,
  onKeyDown,
}: TabsListProps): React.ReactNode {
  const variant = use(TabsContext)?.variant ?? "underline";
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event);
    moveRovingFocus(event, '[role="tab"]', { activate: true });
  };

  return (
    <div
      aria-label={ariaLabel}
      className={cn(tabsListVariants({ variant }), className)}
      onKeyDown={handleKeyDown}
      role="tablist"
      tabIndex={-1}
    >
      {children}
    </div>
  );
}

export type TabsTriggerProps = {
  "aria-controls"?: string;
  "aria-hidden"?: "false" | "true" | boolean;
  children: ReactNode;
  className?: string;
  id?: string;
  tabIndex?: number;
  value: string;
};

/**
 * A tab trigger (`role="tab"`). It sets `aria-selected` and `data-state`
 * (`"active"` or `"inactive"`) from the selected tab; the look follows the
 * `Tabs` variant and every variant draws a `focus-visible` ring.
 */
function TabsTrigger({
  "aria-controls": ariaControls,
  "aria-hidden": ariaHidden,
  children,
  className,
  id,
  tabIndex,
  value,
}: TabsTriggerProps): React.ReactNode {
  const {
    activeTab,
    baseId,
    firstTab,
    panelIds,
    registerTab,
    setActiveTab,
    tabIds,
    variant,
  } = useTabsContext();
  const isActive = activeTab === value;
  const tabId = id ?? `${baseId}-tab-${toIdPart(value)}`;
  const hasActiveTab = tabIds.has(activeTab);
  const isTabStop = isActive || (!hasActiveTab && firstTab === value);

  useEffect(() => registerTab(value, tabId), [registerTab, tabId, value]);

  return (
    <button
      aria-controls={
        ariaControls ?? (isActive ? panelIds.get(value) : undefined)
      }
      aria-hidden={ariaHidden}
      aria-selected={isActive}
      className={cn(tabsTriggerVariants({ variant }), className)}
      data-state={isActive ? "active" : "inactive"}
      id={tabId}
      onClick={() => {
        setActiveTab(value);
      }}
      role="tab"
      tabIndex={tabIndex ?? (isTabStop ? 0 : -1)}
      type="button"
    >
      {children}
    </button>
  );
}

export type TabsContentProps = {
  "aria-hidden"?: "false" | "true" | boolean;
  "aria-labelledby"?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  /**
   * Tab order of the panel. By default the panel is a tab stop (`0`) when it
   * holds no focusable content, so keyboard users can reach it (APG tabs).
   */
  tabIndex?: number;
  value: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/** Whether the panel holds a focusable element, re-checked as it changes. */
function useHasFocusableContent(
  panelRef: React.RefObject<HTMLDivElement | null>,
  isActive: boolean,
): boolean {
  const [hasFocusable, setHasFocusable] = useState(false);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!isActive || !panel) return;
    const measure = (): void => {
      setHasFocusable(panel.querySelector(FOCUSABLE) !== null);
    };
    measure();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(measure);
    observer.observe(panel, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
    };
  }, [isActive, panelRef]);
  return hasFocusable;
}

function TabsContent({
  "aria-hidden": ariaHidden,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  id,
  tabIndex,
  value,
}: TabsContentProps): React.ReactNode {
  const { activeTab, baseId, registerPanel, tabIds } = useTabsContext();
  const isActive = activeTab === value;
  const panelId = id ?? `${baseId}-panel-${toIdPart(value)}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const hasFocusable = useHasFocusableContent(panelRef, isActive);

  useEffect(() => {
    if (!isActive) return;
    return registerPanel(value, panelId);
  }, [isActive, panelId, registerPanel, value]);

  if (!isActive) return null;

  return (
    <div
      aria-hidden={ariaHidden}
      aria-labelledby={ariaLabelledBy ?? tabIds.get(value)}
      className={cn("pt-4", className)}
      id={panelId}
      ref={panelRef}
      role="tabpanel"
      tabIndex={tabIndex ?? (hasFocusable ? undefined : 0)}
    >
      {children}
    </div>
  );
}

// Attach sub-components
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs, TabsContent, TabsList, TabsTrigger };

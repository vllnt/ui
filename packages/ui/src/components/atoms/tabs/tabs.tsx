"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { mergeProps, renderElement } from "@ui-sdk/react/primitive";
import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

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
        pill: "rounded-full data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary/50 data-[state=inactive]:hover:text-foreground",
        underline:
          "-mb-px border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:border-muted-foreground/50 data-[state=inactive]:hover:text-foreground",
      },
    },
  },
);

type TabsContextValue = {
  /** Value of the first rendered trigger. */
  firstTab?: string;
  /** Whether the active value matches a rendered trigger. */
  hasActiveTab: boolean;
  registerTab: (value: string) => () => void;
  /** Reports a press on the selected tab, which ui-sdk ignores. */
  reselect: (value: string) => void;
  variant: TabsVariant;
};

const TabsContext = createContext<null | TabsContextValue>(null);

function useTabsContext(): TabsContextValue {
  const context = use(TabsContext);
  if (!context) {
    throw new Error("Tab components must be used within a Tabs component");
  }
  return context;
}

/** Tracks the values of the rendered triggers, in mount order. */
function useTabValues(): readonly [
  readonly string[],
  (value: string) => () => void,
] {
  const [values, setValues] = useState<readonly string[]>([]);
  const register = useCallback((value: string) => {
    setValues((current) =>
      current.includes(value) ? current : [...current, value],
    );
    return () => {
      setValues((current) => current.filter((item) => item !== value));
    };
  }, []);
  return [values, register];
}

type RenderProps = Record<string, unknown>;

/**
 * Renders a trigger with the attributes Radix emitted (`data-state`) and the
 * caller's overrides of what ui-sdk manages. An override left `undefined`
 * keeps the ui-sdk value. A press on the selected tab calls `onReselect`.
 */
function renderTab(overrides: RenderProps, onReselect: () => void) {
  return (props: RenderProps, state: { selected: boolean }) =>
    renderElement(
      "button",
      mergeProps(props, overrides, {
        "data-state": state.selected ? "active" : "inactive",
        onClick: state.selected ? onReselect : undefined,
      }),
      undefined,
      state,
    );
}

/** Renders a panel with the caller's overrides of what ui-sdk manages. */
function renderPanel(overrides: RenderProps) {
  return (props: RenderProps, state: object) =>
    renderElement("div", mergeProps(props, overrides), undefined, state);
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
 * `Tabs.List` and `Tabs.Trigger` read from context. Without a value, no tab
 * is active until the user picks one.
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
  const activeTab = value ?? internalTab;
  const [tabValues, registerTab] = useTabValues();
  const hasActiveTab = tabValues.includes(activeTab);
  const firstTab = tabValues[0];

  // A press on the selected tab still reports its value, as before ui-sdk.
  const reselect = useCallback(
    (next: string) => {
      onValueChange?.(next);
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({ firstTab, hasActiveTab, registerTab, reselect, variant }),
    [firstTab, hasActiveTab, registerTab, reselect, variant],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsPrimitive
        className={cn("my-6", className)}
        onValueChange={(next) => {
          if (typeof next !== "string") return;
          if (value === undefined) {
            setInternalTab(next);
          }
          onValueChange?.(next);
        }}
        value={activeTab}
      >
        {children}
      </TabsPrimitive>
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
  const context = use(TabsContext);

  if (!context) {
    // The ui-sdk list needs its root, and no trigger can render without one.
    return (
      <div
        aria-label={ariaLabel}
        className={cn(tabsListVariants({ variant: "underline" }), className)}
        onKeyDown={onKeyDown}
        role="tablist"
        tabIndex={-1}
      >
        {children}
      </div>
    );
  }

  return (
    <TabsListPrimitive
      aria-label={ariaLabel}
      className={cn(tabsListVariants({ variant: context.variant }), className)}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      {children}
    </TabsListPrimitive>
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
  const { firstTab, hasActiveTab, registerTab, reselect, variant } =
    useTabsContext();
  // With no active tab, the first trigger stays reachable with the Tab key.
  const isFallbackStop = !hasActiveTab && firstTab === value;

  useEffect(() => registerTab(value), [registerTab, value]);

  return (
    <TabsTab
      aria-hidden={ariaHidden}
      className={cn(tabsTriggerVariants({ variant }), className)}
      id={id}
      render={renderTab(
        {
          "aria-controls": ariaControls,
          tabIndex: tabIndex ?? (isFallbackStop ? 0 : undefined),
        },
        () => {
          reselect(value);
        },
      )}
      value={value}
    >
      {children}
    </TabsTab>
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

function TabsContent({
  "aria-hidden": ariaHidden,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  id,
  tabIndex,
  value,
}: TabsContentProps): React.ReactNode {
  useTabsContext();

  return (
    <TabsPanel
      aria-hidden={ariaHidden}
      className={cn("pt-4", className)}
      id={id}
      render={renderPanel({ "aria-labelledby": ariaLabelledBy })}
      tabIndex={tabIndex}
      value={value}
    >
      {children}
    </TabsPanel>
  );
}

// Attach sub-components
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs, TabsContent, TabsList, TabsTrigger };

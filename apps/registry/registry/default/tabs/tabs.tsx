"use client";

import { createContext, use, useMemo, useState } from "react";

import type { ReactNode } from "react";

import { cn } from "@vllnt/ui";

// Context for tabs state
type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

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
};

function Tabs({
  children,
  className,
  defaultValue = "",
  onValueChange,
  value,
}: TabsProps): React.ReactNode {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalTab;

  const handleSetActiveTab = (next: string): void => {
    if (!isControlled) {
      setInternalTab(next);
    }
    onValueChange?.(next);
  };

  const contextValue = useMemo(
    () => ({ activeTab, setActiveTab: handleSetActiveTab }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, isControlled],
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

function TabsList({
  "aria-label": ariaLabel,
  children,
  className,
  onKeyDown,
}: TabsListProps): React.ReactNode {
  return (
    <div
      aria-label={ariaLabel}
      className={cn("flex border-b border-border overflow-x-auto", className)}
      onKeyDown={onKeyDown}
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

function TabsTrigger({
  "aria-controls": ariaControls,
  "aria-hidden": ariaHidden,
  children,
  className,
  id,
  tabIndex,
  value,
}: TabsTriggerProps): React.ReactNode {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      aria-controls={ariaControls}
      aria-hidden={ariaHidden}
      aria-selected={isActive}
      className={cn(
        "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
        "border-b-2 -mb-px",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
        className,
      )}
      id={id}
      onClick={() => {
        setActiveTab(value);
      }}
      role="tab"
      tabIndex={tabIndex}
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
  value: string;
};

function TabsContent({
  "aria-hidden": ariaHidden,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  id,
  value,
}: TabsContentProps): React.ReactNode {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      aria-hidden={ariaHidden}
      aria-labelledby={ariaLabelledBy}
      className={cn("pt-4", className)}
      id={id}
      role="tabpanel"
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

"use client";

import { createContext, useContext, useMemo } from "react";

import type { ReactNode } from "react";

import { useControllableState } from "../../lib/use-controllable-state";
import { cn } from "../../lib/utils";

// Context for tabs state
type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<null | TabsContextValue>(null);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
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
  const [activeTab, setActiveTab] = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  });

  const contextValue = useMemo(
    () => ({ activeTab, setActiveTab }),
    [activeTab, setActiveTab],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("my-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = {
  children: ReactNode;
  className?: string;
};

function TabsList({ children, className }: TabsListProps): React.ReactNode {
  return (
    <div
      className={cn("flex border-b border-border overflow-x-auto", className)}
      role="tablist"
    >
      {children}
    </div>
  );
}

export type TabsTriggerProps = {
  "aria-hidden"?: "false" | "true" | boolean;
  children: ReactNode;
  className?: string;
  tabIndex?: number;
  value: string;
};

function TabsTrigger({
  "aria-hidden": ariaHidden,
  children,
  className,
  tabIndex,
  value,
}: TabsTriggerProps): React.ReactNode {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
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
  children: ReactNode;
  className?: string;
  value: string;
};

function TabsContent({
  "aria-hidden": ariaHidden,
  children,
  className,
  value,
}: TabsContentProps): React.ReactNode {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      aria-hidden={ariaHidden}
      className={cn("pt-4", className)}
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

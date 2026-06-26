"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** A single tab descriptor. */
export type AnimatedTab = {
  /** Visible label. */
  label: string;
  /** Stable identifier for the tab. */
  value: string;
};

/** Props for {@link AnimatedTabs}. */
export type AnimatedTabsProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Initially active tab value. Defaults to the first tab. */
  defaultValue?: string;
  /** Called with the new value when the active tab changes. */
  onValueChange?: (value: string) => void;
  /** Tabs rendered in order. */
  tabs: AnimatedTab[];
};

type IndicatorStyle = {
  left: number;
  width: number;
};

function indicatorPosition(button: HTMLButtonElement | null): IndicatorStyle {
  if (button === null) {
    return { left: 0, width: 0 };
  }

  return { left: button.offsetLeft, width: button.offsetWidth };
}

function TabButton({
  active,
  label,
  onSelect,
  reference,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
  reference: (node: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      aria-selected={active}
      className={cn(
        "relative z-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "text-primary-foreground" : "text-muted-foreground",
      )}
      onClick={onSelect}
      ref={reference}
      role="tab"
      type="button"
    >
      {label}
    </button>
  );
}

/**
 * Row of tabs with a pill that slides behind the active tab.
 *
 * Respects `prefers-reduced-motion`: the pill jumps without sliding.
 *
 * @example
 * ```tsx
 * <AnimatedTabs tabs={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} />
 * ```
 */
export const AnimatedTabs = ({
  className,
  defaultValue,
  onValueChange,
  ref,
  tabs,
  ...props
}: AnimatedTabsProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [active, setActive] = React.useState(defaultValue ?? tabs[0]?.value);
  const [indicator, setIndicator] = React.useState<IndicatorStyle>({
    left: 0,
    width: 0,
  });
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());

  React.useLayoutEffect(() => {
    setIndicator(indicatorPosition(buttons.current.get(active ?? "") ?? null));
  }, [active]);

  const handleSelect = (value: string): void => {
    setActive(value);
    onValueChange?.(value);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1",
        className,
      )}
      ref={ref}
      role="tablist"
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 z-0 h-[calc(100%-0.5rem)] rounded-md bg-primary transition-all duration-300 ease-out motion-reduce:transition-none"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {tabs.map((tab) => (
        <TabButton
          active={tab.value === active}
          key={tab.value}
          label={tab.label}
          onSelect={() => {
            handleSelect(tab.value);
          }}
          reference={(node) => {
            if (node === null) {
              buttons.current.delete(tab.value);
            } else {
              buttons.current.set(tab.value, node);
            }
          }}
        />
      ))}
    </div>
  );
};
AnimatedTabs.displayName = "AnimatedTabs";

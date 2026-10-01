"use client";

import {
  createContext,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { View, type ViewProps } from "react-native";

import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";
import { useControllableState } from "../../../primitives/use-controllable-state";

/** Visual density supplied to native sidebar consumers. */
export type SidebarPresentation = "compact" | "expanded";

/** State exposed to native sidebar components. */
export type SidebarContextValue = {
  readonly open: boolean;
  readonly presentation: SidebarPresentation;
  readonly setOpen: (open: boolean) => void;
  readonly toggle: () => void;
};

/** Props for the native sidebar state boundary. */
export type SidebarProviderProps = Omit<ViewProps, "children" | "ref"> & {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly presentation?: SidebarPresentation;
  readonly ref?: Ref<View>;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
);

/** Reads native sidebar state from the nearest provider. */
function useSidebar(): SidebarContextValue {
  const context = use(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

/** Controlled or uncontrolled native sidebar state without viewport assumptions. */
function SidebarProvider({
  children,
  defaultOpen = false,
  onOpenChange,
  open,
  presentation = "expanded",
  ref,
  ...props
}: SidebarProviderProps) {
  const stateOptions: ControllableStateOptions<boolean> =
    open === undefined
      ? {
          defaultValue: defaultOpen,
          mode: "uncontrolled",
          onChange: onOpenChange,
        }
      : { mode: "controlled", onChange: onOpenChange, value: open };
  const controlled = open !== undefined;
  const [resolvedOpen, setResolvedOpen] = useControllableState(stateOptions);
  // Uncontrolled updates read this ref so repeated calls before a re-render
  // build on each other; controlled updates always derive from the owner value.
  const latestOpenRef = useRef(resolvedOpen);
  useLayoutEffect(() => {
    latestOpenRef.current = resolvedOpen;
  }, [resolvedOpen]);
  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!controlled) latestOpenRef.current = nextOpen;
      setResolvedOpen(nextOpen);
    },
    [controlled, setResolvedOpen],
  );
  const toggle = useCallback(() => {
    setOpen(!(controlled ? resolvedOpen : latestOpenRef.current));
  }, [controlled, resolvedOpen, setOpen]);
  const value = useMemo(
    () => ({ open: resolvedOpen, presentation, setOpen, toggle }),
    [presentation, resolvedOpen, setOpen, toggle],
  );

  return (
    <SidebarContext value={value}>
      <View {...props} ref={ref}>
        {children}
      </View>
    </SidebarContext>
  );
}
SidebarProvider.displayName = "SidebarProvider";

export { SidebarProvider, useSidebar };

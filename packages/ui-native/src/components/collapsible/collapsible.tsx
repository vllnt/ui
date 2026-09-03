"use client";

import {
  createContext,
  type ReactNode,
  type Ref,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Animated,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for controlled or uncontrolled native collapsible content. */
export type CollapsibleProps = Omit<ViewProps, "children" | "ref"> & {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly id: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
};

/** Props for the native collapsible disclosure button. */
export type CollapsibleTriggerProps = Omit<
  PressableProps,
  "accessibilityLabel" | "children" | "onPress" | "ref"
> & {
  readonly children: ReactNode;
  readonly label: string;
  readonly ref?: Ref<View>;
};

/** Props for content mounted while its native collapsible is open. */
export type CollapsibleContentProps = Omit<ViewProps, "children" | "ref"> & {
  readonly children: ReactNode;
  readonly ref?: Ref<View>;
};

type CollapsibleContextValue = {
  readonly id: string;
  readonly open: boolean;
  readonly reduceMotion: boolean;
  readonly toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue | undefined>(
  undefined,
);

function useCollapsible(): CollapsibleContextValue {
  const context = use(CollapsibleContext);
  if (!context)
    throw new Error("Collapsible parts must be used within Collapsible");
  return context;
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

/** Native disclosure state boundary with caller-owned stable identifiers. */
function Collapsible({
  children,
  defaultOpen = false,
  id,
  onOpenChange,
  open,
  reducedMotionService,
  ref,
  style,
  ...props
}: CollapsibleProps) {
  const [expanded, setExpanded] = useControllableState(
    open === undefined
      ? {
          defaultValue: defaultOpen,
          mode: "uncontrolled",
          onChange: onOpenChange,
        }
      : { mode: "controlled", onChange: onOpenChange, value: open },
  );
  const reduceMotion = useReducedMotion(reducedMotionService);
  const value = useMemo(
    () => ({
      id,
      open: expanded,
      reduceMotion,
      toggle: () => {
        setExpanded(!expanded);
      },
    }),
    [expanded, id, reduceMotion, setExpanded],
  );
  return (
    <CollapsibleContext value={value}>
      <View {...props} ref={ref} style={style}>
        {children}
      </View>
    </CollapsibleContext>
  );
}
Collapsible.displayName = "Collapsible";

/** Accessible 44-point disclosure control for native collapsible content. */
function CollapsibleTrigger({
  children,
  disabled = false,
  label,
  ref,
  style,
  ...props
}: CollapsibleTriggerProps) {
  const theme = useTheme();
  const collapsible = useCollapsible();
  const handlePress = () => {
    collapsible.toggle();
  };
  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled === true,
        expanded: collapsible.open,
      }}
      aria-controls={`${collapsible.id}-content`}
      disabled={disabled}
      id={`${collapsible.id}-trigger`}
      onPress={handlePress}
      ref={ref}
      style={(state) => [
        styles.trigger,
        {
          backgroundColor: state.pressed
            ? theme.colors.accent
            : theme.colors.background,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : state.pressed ? 0.8 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}
CollapsibleTrigger.displayName = "CollapsibleTrigger";

/** Collapsed content removed from layout and accessibility when closed. */
function CollapsibleContent({
  children,
  ref,
  style,
  ...props
}: CollapsibleContentProps) {
  const collapsible = useCollapsible();
  const [progress, setProgress] = useState(
    () => new Animated.Value(collapsible.reduceMotion ? 1 : 0),
  );
  void setProgress;
  useEffect(() => {
    if (!collapsible.open) return;
    Animated.timing(progress, {
      duration: collapsible.reduceMotion ? 0 : 100,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [collapsible.open, collapsible.reduceMotion, progress]);

  if (!collapsible.open) return null;
  return (
    <Animated.View
      {...props}
      aria-labelledby={`${collapsible.id}-trigger`}
      id={`${collapsible.id}-content`}
      ref={ref}
      style={[
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleContent, CollapsibleTrigger };

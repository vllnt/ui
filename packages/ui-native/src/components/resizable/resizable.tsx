"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  type AccessibilityActionEvent,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Native resizable panel direction. */
export type ResizableDirection = "horizontal" | "vertical";

/** Props for a native resizable panel group. */
export type ResizablePanelGroupProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly direction?: ResizableDirection;
  readonly onSizesChange?: (sizes: readonly number[]) => void;
  readonly ref?: Ref<View>;
};

/** Props for one native resizable panel. */
export type ResizablePanelProps = Omit<ViewProps, "ref"> & {
  readonly defaultSize?: number;
  readonly maxSize?: number;
  readonly minSize?: number;
  readonly ref?: Ref<View>;
};

/** Props for an accessible native resize control. */
export type ResizableHandleProps = Omit<
  ViewProps,
  "children" | "onAccessibilityAction" | "ref"
> & {
  readonly decrementLabel?: string;
  readonly disabled?: boolean;
  readonly incrementLabel?: string;
  readonly ref?: Ref<View>;
  readonly step?: number;
  readonly withHandle?: boolean;
};

type PanelConfig = {
  readonly defaultSize: number;
  readonly maxSize: number;
  readonly minSize: number;
};

type ResizableContextValue = {
  readonly adjust: (handleIndex: number, amount: number) => void;
  readonly configs: readonly PanelConfig[];
  readonly direction: ResizableDirection;
  readonly sizes: readonly number[];
};

type InternalResizablePanelProps = ResizablePanelProps & {
  readonly panelIndex?: number;
};

type InternalResizableHandleProps = ResizableHandleProps & {
  readonly handleIndex?: number;
};

type ResizableSizeState = {
  readonly configSignature: string;
  readonly sizes: readonly number[];
};

const ResizableContext = createContext<null | ResizableContextValue>(null);

const styles = StyleSheet.create({
  dividerHorizontal: { height: "100%", width: 1 },
  dividerVertical: { height: 1, width: "100%" },
  gripHorizontal: { borderWidth: 1, height: 20, width: 12 },
  gripVertical: { borderWidth: 1, height: 12, width: 20 },
  handle: { alignItems: "center", justifyContent: "center" },
  handleHorizontal: { alignSelf: "stretch", minHeight: 44, width: 44 },
  handleVertical: { height: 44, minWidth: 44, width: "100%" },
  horizontal: { flexDirection: "row" },
  panel: { flexBasis: 0, flexShrink: 1, overflow: "hidden" },
  root: { alignItems: "stretch", height: "100%", width: "100%" },
  vertical: { flexDirection: "column" },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getPanelConfigs(children: ReactNode): PanelConfig[] {
  return Children.toArray(children).reduce<PanelConfig[]>((configs, child) => {
    if (
      isValidElement<InternalResizablePanelProps>(child) &&
      child.type === ResizablePanel
    ) {
      const minSize = clamp(child.props.minSize ?? 10, 0, 100);
      const maxSize = clamp(child.props.maxSize ?? 90, minSize, 100);
      configs.push({
        defaultSize: clamp(child.props.defaultSize ?? 50, minSize, maxSize),
        maxSize,
        minSize,
      });
    }
    return configs;
  }, []);
}

function normalizeSizes(configs: readonly PanelConfig[]): number[] {
  if (configs.length === 0) return [];
  const minimumTotal = configs.reduce((sum, config) => sum + config.minSize, 0);
  const maximumTotal = configs.reduce((sum, config) => sum + config.maxSize, 0);
  if (minimumTotal > 100 || maximumTotal < 100) {
    throw new Error(
      "Resizable panel constraints must allow the group to total 100 percent.",
    );
  }

  const defaults = configs.map((config) => config.defaultSize);
  const defaultTotal = defaults.reduce((sum, size) => sum + size, 0);
  const difference = 100 - defaultTotal;
  if (Math.abs(difference) < Number.EPSILON) return defaults;

  const capacities = configs.map((config, index) =>
    difference > 0
      ? config.maxSize - (defaults[index] ?? 0)
      : (defaults[index] ?? 0) - config.minSize,
  );
  const totalCapacity = capacities.reduce((sum, capacity) => sum + capacity, 0);
  if (totalCapacity < Math.abs(difference)) {
    throw new Error(
      "Resizable panel defaults cannot be normalized within their constraints.",
    );
  }

  return defaults.map(
    (size, index) =>
      size + difference * ((capacities[index] ?? 0) / totalCapacity),
  );
}

function resizePanels({
  amount,
  configs,
  handleIndex,
  sizes,
}: {
  readonly amount: number;
  readonly configs: readonly PanelConfig[];
  readonly handleIndex: number;
  readonly sizes: readonly number[];
}): readonly number[] {
  const afterIndex = handleIndex + 1;
  const beforeConfig = configs[handleIndex];
  const afterConfig = configs[afterIndex];
  const beforeSize = sizes[handleIndex];
  const afterSize = sizes[afterIndex];
  if (
    !beforeConfig ||
    !afterConfig ||
    beforeSize === undefined ||
    afterSize === undefined
  ) {
    return sizes;
  }
  const increaseLimit = Math.min(
    beforeConfig.maxSize - beforeSize,
    afterSize - afterConfig.minSize,
  );
  const decreaseLimit = Math.min(
    beforeSize - beforeConfig.minSize,
    afterConfig.maxSize - afterSize,
  );
  const resolvedAmount = clamp(amount, -decreaseLimit, increaseLimit);
  if (resolvedAmount === 0) return sizes;
  return sizes.map((size, index) => {
    if (index === handleIndex) return size + resolvedAmount;
    if (index === afterIndex) return size - resolvedAmount;
    return size;
  });
}

function indexResizableChildren(children: ReactNode): ReactNode {
  const childArray = Children.toArray(children);
  return childArray.map((child, childIndex) => {
    const preceding = childArray.slice(0, childIndex);
    if (
      isValidElement<InternalResizablePanelProps>(child) &&
      child.type === ResizablePanel
    ) {
      const panelIndex = preceding.filter(
        (candidate) =>
          isValidElement<InternalResizablePanelProps>(candidate) &&
          candidate.type === ResizablePanel,
      ).length;
      return cloneElement(child, { panelIndex });
    }
    if (
      isValidElement<InternalResizableHandleProps>(child) &&
      child.type === ResizableHandle
    ) {
      const handleIndex =
        preceding.filter(
          (candidate) =>
            isValidElement<InternalResizablePanelProps>(candidate) &&
            candidate.type === ResizablePanel,
        ).length - 1;
      return cloneElement(child, { handleIndex });
    }
    return child;
  });
}

/**
 * Native panel layout coordinated by accessible resize actions. Pointer and
 * touch dragging are intentionally omitted rather than approximating DOM drag.
 */
function ResizablePanelGroup({
  children,
  direction = "horizontal",
  onSizesChange,
  ref,
  style,
  ...props
}: ResizablePanelGroupProps) {
  const configs = useMemo(() => getPanelConfigs(children), [children]);
  const configSignature = JSON.stringify(configs);
  const [sizeState, setSizeState] = useState<ResizableSizeState>(() => ({
    configSignature,
    sizes: normalizeSizes(configs),
  }));
  const sizes =
    sizeState.configSignature === configSignature
      ? sizeState.sizes
      : normalizeSizes(configs);
  if (sizeState.configSignature !== configSignature) {
    setSizeState({ configSignature, sizes });
  }
  const adjust = useCallback(
    (handleIndex: number, amount: number) => {
      const nextSizes = resizePanels({ amount, configs, handleIndex, sizes });
      if (nextSizes === sizes) return;
      setSizeState({ configSignature, sizes: nextSizes });
      onSizesChange?.(nextSizes);
    },
    [configSignature, configs, onSizesChange, sizes],
  );
  const context = useMemo<ResizableContextValue>(
    () => ({ adjust, configs, direction, sizes }),
    [adjust, configs, direction, sizes],
  );
  const indexedChildren = useMemo(
    () => indexResizableChildren(children),
    [children],
  );

  return (
    <ResizableContext value={context}>
      <View
        {...props}
        ref={ref}
        style={[
          styles.root,
          direction === "horizontal" ? styles.horizontal : styles.vertical,
          style,
        ]}
      >
        {indexedChildren}
      </View>
    </ResizableContext>
  );
}
ResizablePanelGroup.displayName = "ResizablePanelGroup";

/** Flexible content region inside a native ResizablePanelGroup. */
function ResizablePanel({
  defaultSize = 50,
  maxSize = 100,
  minSize = 0,
  panelIndex = 0,
  ref,
  style,
  ...props
}: InternalResizablePanelProps) {
  const context = use(ResizableContext);
  const size =
    context?.sizes[panelIndex] ?? clamp(defaultSize, minSize, maxSize);
  return (
    <View
      {...props}
      ref={ref}
      style={[styles.panel, { flexGrow: Math.max(0, size) }, style]}
    />
  );
}
ResizablePanel.displayName = "ResizablePanel";

function ResizeIndicator({
  horizontal,
  withHandle,
}: {
  readonly horizontal: boolean;
  readonly withHandle: boolean;
}) {
  const theme = useTheme();
  return (
    <>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          horizontal ? styles.dividerHorizontal : styles.dividerVertical,
          { backgroundColor: theme.colors.border },
        ]}
      />
      {withHandle ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            horizontal ? styles.gripHorizontal : styles.gripVertical,
            {
              backgroundColor: theme.colors.muted,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.sm,
              position: "absolute",
            },
          ]}
        />
      ) : null}
    </>
  );
}
ResizeIndicator.displayName = "ResizeIndicator";

/** 44-point adjustable action between adjacent native panels. */
function ResizableHandle({
  accessibilityLabel = "Resize panels",
  accessibilityState,
  decrementLabel = "Decrease previous panel",
  disabled = false,
  handleIndex = 0,
  incrementLabel = "Increase previous panel",
  ref,
  step = 5,
  style,
  withHandle = false,
  ...props
}: InternalResizableHandleProps) {
  const context = use(ResizableContext);
  const direction = context?.direction ?? "horizontal";
  const config = context?.configs[handleIndex];
  const size = context?.sizes[handleIndex];
  const afterConfig = context?.configs[handleIndex + 1];
  const afterSize = context?.sizes[handleIndex + 1];
  const isDisabled =
    disabled ||
    !context ||
    config === undefined ||
    size === undefined ||
    afterConfig === undefined ||
    afterSize === undefined;
  const change = (amount: number) => {
    if (!isDisabled) context.adjust(handleIndex, amount);
  };
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    const resolvedStep = step > 0 ? step : 1;
    if (event.nativeEvent.actionName === "increment") change(resolvedStep);
    if (event.nativeEvent.actionName === "decrement") change(-resolvedStep);
  };
  const horizontal = direction === "horizontal";

  return (
    <View
      {...props}
      accessibilityActions={[
        { label: decrementLabel, name: "decrement" },
        { label: incrementLabel, name: "increment" },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      accessibilityValue={
        config && size !== undefined
          ? {
              max: config.maxSize,
              min: config.minSize,
              now: Math.round(size),
              text: `${Math.round(size)} percent`,
            }
          : undefined
      }
      accessible
      focusable={!isDisabled}
      onAccessibilityAction={handleAccessibilityAction}
      ref={ref}
      style={[
        styles.handle,
        horizontal ? styles.handleHorizontal : styles.handleVertical,
        style,
      ]}
    >
      <ResizeIndicator horizontal={horizontal} withHandle={withHandle} />
    </View>
  );
}
ResizableHandle.displayName = "ResizableHandle";

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };

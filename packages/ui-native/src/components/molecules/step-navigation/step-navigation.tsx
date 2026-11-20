import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useAnnounceOnChange } from "../../../primitives/accessibility";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { useTheme } from "../../../theme/theme-provider";
import { Text } from "../../atoms/text/text";

/** Localizable labels for native step navigation. */
export type StepNavigationLabels = {
  readonly navigation?: string;
  readonly next?: string;
  readonly nextAccessibility?: string;
  readonly previous?: string;
  readonly previousAccessibility?: string;
  readonly step?: string;
};

/** Props for moving through caller-owned step state. */
export type StepNavigationProps = Omit<ViewProps, "children" | "ref"> & {
  readonly canNext: boolean;
  readonly canPrevious: boolean;
  readonly currentStep: number;
  readonly labels?: StepNavigationLabels;
  readonly nextIcon?: ReactNode;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly previousIcon?: ReactNode;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly totalSteps: number;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  counter: { fontVariant: ["tabular-nums"] },
  root: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

/**
 * Accessible previous/next controls for a caller-owned step flow. The step
 * counter is announced when it changes, the navigation name is each button's
 * hint, and disabled buttons dim.
 */
function StepNavigation({
  canNext,
  canPrevious,
  currentStep,
  labels,
  nextIcon,
  onNext,
  onPrevious,
  previousIcon,
  ref,
  safeArea,
  style,
  totalSteps,
  ...props
}: StepNavigationProps) {
  const theme = useTheme();
  const resolved = {
    navigation:
      props.accessibilityLabel ?? labels?.navigation ?? "Step navigation",
    next: labels?.next ?? "Next",
    nextAccessibility: labels?.nextAccessibility ?? "Next step",
    previous: labels?.previous ?? "Previous",
    previousAccessibility: labels?.previousAccessibility ?? "Previous step",
    step: labels?.step ?? "Step",
  };
  const counter = `${resolved.step} ${currentStep} / ${totalSteps}`;
  useAnnounceOnChange(counter);
  const actionStyle = [
    styles.action,
    {
      borderRadius: theme.radius.md,
      gap: theme.spacing[1],
      paddingHorizontal: theme.spacing[3],
    },
  ];
  const content = (
    <View
      {...props}
      accessibilityLabel={undefined}
      accessibilityRole="none"
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[2],
        },
        style,
      ]}
    >
      <InteractivePressable
        accessibilityHint={resolved.navigation}
        accessibilityLabel={resolved.previousAccessibility}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canPrevious }}
        disabled={!canPrevious}
        onPress={onPrevious}
        style={actionStyle}
      >
        {previousIcon}
        <Text size="small" weight="medium">
          {resolved.previous}
        </Text>
      </InteractivePressable>
      <Text size="small" style={styles.counter} tone="muted">
        {counter}
      </Text>
      <InteractivePressable
        accessibilityHint={resolved.navigation}
        accessibilityLabel={resolved.nextAccessibility}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canNext }}
        disabled={!canNext}
        onPress={onNext}
        style={actionStyle}
      >
        <Text size="small" weight="medium">
          {resolved.next}
        </Text>
        {nextIcon}
      </InteractivePressable>
    </View>
  );
  return safeArea ? safeArea(content) : content;
}
StepNavigation.displayName = "StepNavigation";

export { StepNavigation };

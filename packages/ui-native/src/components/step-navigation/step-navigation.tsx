import type { ReactNode, Ref } from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

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
    minHeight: 44,
    minWidth: 44,
  },
  counter: { fontVariant: ["tabular-nums"] },
  root: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

/** Accessible previous/next controls for a caller-owned step flow. */
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
    navigation: labels?.navigation ?? "Step navigation",
    next: labels?.next ?? "Next",
    nextAccessibility: labels?.nextAccessibility ?? "Next step",
    previous: labels?.previous ?? "Previous",
    previousAccessibility: labels?.previousAccessibility ?? "Previous step",
    step: labels?.step ?? "Step",
  };
  const actionStyle = ({ pressed }: { readonly pressed: boolean }) => [
    styles.action,
    {
      backgroundColor: pressed ? theme.colors.accent : "transparent",
      borderRadius: theme.radius.md,
      gap: theme.spacing[1],
      opacity: pressed ? 0.8 : 1,
      paddingHorizontal: theme.spacing[3],
    },
  ];
  const content = (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? resolved.navigation}
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
      <Pressable
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
      </Pressable>
      <Text size="small" style={styles.counter} tone="muted">
        {resolved.step} {currentStep} / {totalSteps}
      </Text>
      <Pressable
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
      </Pressable>
    </View>
  );
  return safeArea ? safeArea(content) : content;
}
StepNavigation.displayName = "StepNavigation";

export { StepNavigation };

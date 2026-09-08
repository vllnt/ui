"use client";

import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  type Text as NativeText,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** State of one native agent step, including unavailable services. */
export type AgentStepStatus =
  | "completed"
  | "error"
  | "pending"
  | "running"
  | "skipped"
  | "unavailable";

/** State of the native agent activity surface. */
export type AgentActivityStatus =
  | "completed"
  | "error"
  | "idle"
  | "running"
  | "unavailable";

/** Caller-localized activity copy and status names. */
export type AgentActivityLabels = {
  readonly activity: string;
  readonly collapse: string;
  readonly elapsed: string;
  readonly expand: string;
  readonly status: Readonly<
    Record<AgentActivityStatus | AgentStepStatus, string>
  >;
};

/** Props for the native agent activity surface. */
export type AgentActivityProps = ViewProps & {
  readonly elapsed?: ReactNode;
  readonly labels: AgentActivityLabels;
  readonly ref?: Ref<View>;
  readonly status?: AgentActivityStatus;
};

/** Props for one native agent activity step. */
export type AgentStepProps = ViewProps & {
  readonly defaultOpen?: boolean;
  readonly icon?: ReactNode;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly status: AgentStepStatus;
};

export type AgentStepTitleProps = TextProps & {
  readonly ref?: Ref<NativeText>;
};
export type AgentStepDurationProps = TextProps & {
  readonly ref?: Ref<NativeText>;
};
export type AgentStepDetailProps = ViewProps & { readonly ref?: Ref<View> };

/** Props for native step progress. */
export type AgentStepProgressProps = Omit<ViewProps, "children"> & {
  readonly label: string;
  readonly ref?: Ref<View>;
  readonly value: number;
};

type StepContextValue = { readonly status: AgentStepStatus };
const StepContext = createContext<StepContextValue>({ status: "pending" });
const LabelsContext = createContext<AgentActivityLabels | null>(null);

function useLabels(): AgentActivityLabels {
  const labels = use(LabelsContext);
  if (!labels) {
    throw new Error(
      "AgentActivity parts must be rendered inside AgentActivity.",
    );
  }
  return labels;
}

const styles = StyleSheet.create({
  activity: {
    borderWidth: 1,
  },
  detail: {
    borderTopWidth: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    minWidth: 24,
  },
  pressed: {
    opacity: 0.8,
  },
  progress: {
    height: 6,
    overflow: "hidden",
  },
  progressValue: {
    height: "100%",
  },
  step: {
    borderWidth: 1,
    overflow: "hidden",
  },
  stepHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  stepHeaderContent: {
    flex: 1,
  },
  steps: {
    flexDirection: "column",
  },
  toggle: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

function getStepColor(
  status: AgentStepStatus,
  colors: {
    readonly destructive: string;
    readonly mutedForeground: string;
    readonly primary: string;
  },
): string {
  if (status === "error" || status === "unavailable") {
    return colors.destructive;
  }
  if (status === "running" || status === "completed") return colors.primary;
  return colors.mutedForeground;
}

function ActivityHeader({
  elapsed,
  labels,
  status,
}: {
  readonly elapsed?: ReactNode;
  readonly labels: AgentActivityLabels;
  readonly status: AgentActivityStatus;
}) {
  const theme = useTheme();
  const failed = status === "error" || status === "unavailable";
  return (
    <View style={[styles.header, { gap: theme.spacing[3] }]}>
      <View>
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {labels.activity}
        </Text>
        <Text
          style={[
            theme.typography.scale.caption,
            {
              color: failed
                ? theme.colors.destructive
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {labels.status[status]}
        </Text>
      </View>
      {elapsed ? (
        <View accessibilityLabel={labels.elapsed}>{elapsed}</View>
      ) : null}
    </View>
  );
}
ActivityHeader.displayName = "ActivityHeader";

/** Native activity surface for agent steps and service state. */
function AgentActivity({
  children,
  elapsed,
  labels,
  ref,
  status = "idle",
  style,
  ...props
}: AgentActivityProps) {
  const theme = useTheme();
  return (
    <LabelsContext value={labels}>
      <View
        {...props}
        accessibilityLabel={`${labels.activity}, ${labels.status[status]}`}
        accessibilityLiveRegion={status === "running" ? "polite" : "none"}
        ref={ref}
        style={[
          styles.activity,
          {
            backgroundColor: theme.colors.background,
            borderColor:
              status === "error" || status === "unavailable"
                ? theme.colors.destructive
                : theme.colors.border,
            borderRadius: theme.radius.lg,
            gap: theme.spacing[3],
            padding: theme.spacing[4],
          },
          style,
        ]}
      >
        <ActivityHeader elapsed={elapsed} labels={labels} status={status} />
        <View
          accessibilityRole="list"
          style={[styles.steps, { gap: theme.spacing[2] }]}
        >
          {children}
        </View>
      </View>
    </LabelsContext>
  );
}
AgentActivity.displayName = "AgentActivity";

function AgentStepDetail({ ref, style, ...props }: AgentStepDetailProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        {
          gap: theme.spacing[2],
          padding: theme.spacing[3],
          paddingLeft: theme.spacing[8],
        },
        style,
      ]}
    />
  );
}
AgentStepDetail.displayName = "AgentStepDetail";

function splitStepChildren(children: ReactNode): {
  readonly details: ReactNode[];
  readonly header: ReactNode[];
} {
  const details: ReactNode[] = [];
  const header: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === AgentStepDetail) {
      details.push(child);
    } else {
      header.push(child);
    }
  });
  return { details, header };
}

type StepHeaderProps = {
  readonly hasDetails: boolean;
  readonly header: ReactNode;
  readonly icon?: ReactNode;
  readonly isOpen: boolean;
  readonly labels: AgentActivityLabels;
  readonly onToggle: () => void;
  readonly status: AgentStepStatus;
  readonly statusColor: string;
};

function StepHeader({
  hasDetails,
  header,
  icon,
  isOpen,
  labels,
  onToggle,
  status,
  statusColor,
}: StepHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.stepHeader,
        { gap: theme.spacing[2], padding: theme.spacing[3] },
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.icon}
      >
        {icon}
      </View>
      <View style={[styles.stepHeaderContent, { gap: theme.spacing[1] }]}>
        {header}
        <Text style={[theme.typography.scale.caption, { color: statusColor }]}>
          {labels.status[status]}
        </Text>
      </View>
      {hasDetails ? (
        <Pressable
          accessibilityLabel={isOpen ? labels.collapse : labels.expand}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          onPress={onToggle}
          style={({ pressed }) => [
            styles.toggle,
            { borderRadius: theme.radius.sm },
            pressed ? styles.pressed : undefined,
          ]}
        >
          <Text
            style={[
              theme.typography.scale.caption,
              { color: theme.colors.mutedForeground },
            ]}
          >
            {isOpen ? labels.collapse : labels.expand}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
StepHeader.displayName = "StepHeader";

/** One status-aware row in a native agent activity surface. */
function AgentStep({
  children,
  defaultOpen = true,
  icon,
  onOpenChange,
  open,
  ref,
  status,
  style,
  ...props
}: AgentStepProps) {
  const theme = useTheme();
  const labels = useLabels();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;
  const detailId = useId();
  const split = useMemo(() => splitStepChildren(children), [children]);
  const hasDetails = split.details.length > 0;
  const statusColor = getStepColor(status, theme.colors);

  const handleToggle = useCallback(() => {
    const next = !isOpen;
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [controlled, isOpen, onOpenChange]);

  const context = useMemo<StepContextValue>(() => ({ status }), [status]);

  return (
    <StepContext value={context}>
      <View
        {...props}
        accessibilityLabel={labels.status[status]}
        accessibilityState={{ busy: status === "running" }}
        ref={ref}
        style={[
          styles.step,
          {
            backgroundColor: theme.colors.card,
            borderColor: statusColor,
            borderRadius: theme.radius.md,
          },
          style,
        ]}
      >
        <StepHeader
          hasDetails={hasDetails}
          header={split.header}
          icon={icon}
          isOpen={isOpen}
          labels={labels}
          onToggle={handleToggle}
          status={status}
          statusColor={statusColor}
        />
        {hasDetails && isOpen ? (
          <View
            nativeID={detailId}
            style={[styles.detail, { borderColor: theme.colors.border }]}
          >
            {split.details}
          </View>
        ) : null}
      </View>
    </StepContext>
  );
}
AgentStep.displayName = "AgentStep";

/** Primary text for a native agent step. */
function AgentStepTitle({ ref, style, ...props }: AgentStepTitleProps) {
  const theme = useTheme();
  return (
    <Text
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.caption,
        },
        style,
      ]}
    />
  );
}
AgentStepTitle.displayName = "AgentStepTitle";

/** Caller-formatted duration for a native agent step. */
function AgentStepDuration({ ref, style, ...props }: AgentStepDurationProps) {
  const theme = useTheme();
  return (
    <Text
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.caption,
        { color: theme.colors.mutedForeground },
        style,
      ]}
    />
  );
}
AgentStepDuration.displayName = "AgentStepDuration";

/** Token-driven progress for a native agent step. */
function AgentStepProgress({
  label,
  ref,
  style,
  value,
  ...props
}: AgentStepProgressProps) {
  const theme = useTheme();
  const clamped = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: clamped }}
      accessible
      ref={ref}
      style={[
        styles.progress,
        {
          backgroundColor: theme.colors.muted,
          borderRadius: theme.radius.full,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.progressValue,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            width: `${clamped}%`,
          },
        ]}
      />
    </View>
  );
}
AgentStepProgress.displayName = "AgentStepProgress";

/** Supporting text block inside a native agent step detail region. */
function AgentStepDetailText({ ref, style, ...props }: AgentStepTitleProps) {
  const theme = useTheme();
  return (
    <Text
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.caption,
        { color: theme.colors.mutedForeground },
        style,
      ]}
    />
  );
}
AgentStepDetailText.displayName = "AgentStepDetailText";

/** Reads the nearest native agent step status. */
function useAgentStepStatus(): AgentStepStatus {
  return use(StepContext).status;
}

export {
  AgentActivity,
  AgentStep,
  AgentStepDetail,
  AgentStepDetailText,
  AgentStepDuration,
  AgentStepProgress,
  AgentStepTitle,
  useAgentStepStatus,
};

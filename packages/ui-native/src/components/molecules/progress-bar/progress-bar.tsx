"use client";

import { type ReactNode, type Ref, useEffect, useMemo } from "react";

import type { NativeTheme } from "@vllnt/ui-core";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { decorativeProps, plainText } from "../../../primitives/accessibility";
import { withAlpha } from "../../../primitives/color-alpha";
import {
  type StatusTone,
  statusToneColor,
} from "../../../primitives/status-tone";
import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";
import { Text } from "../../atoms/text/text";

/** Localized status words; English defaults keep the previous output. */
export type ProgressBarLabels = {
  /** Status when complete. Defaults to "Complete". */
  readonly complete?: string;
  /** Loading text for a status. Defaults to `Loading <status in lower case>`. */
  readonly loading?: (status: string) => string;
  /** Status while in progress. Defaults to "Progress". */
  readonly progress?: string;
};

/** Progress mode, as on web. */
export type ProgressBarMode = "determinate" | "indeterminate";

/** Track height, as on web. */
export type ProgressBarSize = "lg" | "md" | "sm";

/** Colour role of the fill, as on web. */
export type ProgressBarTone = StatusTone;

/** Props for an accessible native progress indicator. */
export type ProgressBarProps = Omit<ViewProps, "children"> & {
  /**
   * Draws the track as ten equal blocks. One block fills for each whole 10% of
   * `value / max`, so a full row means the task reached 100%. The spoken value
   * stays exact. An `indeterminate` bar keeps its continuous sweep, and a
   * loading bar shows ten empty blocks.
   */
  readonly blocks?: boolean;
  readonly completedLabel?: string;
  readonly currentLabel?: string;
  /** Marks the task done. Ends `indeterminate` mode and tints the card. */
  readonly isComplete?: boolean;
  /** Shows an empty bar and speaks a loading status instead of a value. */
  readonly isLoading?: boolean;
  /**
   * Visible label in the header row. It takes priority over `currentLabel`.
   * A string also names the bar for screen readers; for other content, the
   * name comes from `currentLabel` or the status word.
   */
  readonly label?: ReactNode;
  readonly labels?: ProgressBarLabels;
  readonly max: number;
  /**
   * `"indeterminate"` shows a sweeping bar and speaks no current value, the
   * way ARIA reports an unknown value, and reports the busy state instead.
   * The bar then ignores `value` and `max`. Defaults to `"determinate"`.
   */
  readonly mode?: ProgressBarMode;
  /** Replaces the system reduced-motion query, for tests and previews. */
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly showLabels?: boolean;
  /** Shows the percentage as the value text when `valueLabel` is absent. */
  readonly showValue?: boolean;
  /** Track height: `"sm"`, `"md"` or `"lg"`. Defaults to `"md"`. */
  readonly size?: ProgressBarSize;
  /**
   * Colour role of the fill. Defaults to `"primary"`, or `"success"` for a
   * complete task.
   */
  readonly tone?: ProgressBarTone;
  readonly value: number;
  /** Value text in the header row, for example a step label such as `3 / 8`. */
  readonly valueLabel?: ReactNode;
};

type ProgressState = {
  readonly complete: boolean;
  readonly max: number;
  readonly percent: number;
  readonly value: number;
};

const BLOCKS = Array.from({ length: 10 }, (_, index) => index + 1);
const INDETERMINATE_SHARE = 100 / 3;
const SWEEP_MILLISECONDS = 1400;

const styles = StyleSheet.create({
  block: { flex: 1, height: "100%" },
  blocks: { flexDirection: "row" },
  fill: { height: "100%" },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  root: { borderWidth: 1 },
  track: { overflow: "hidden", width: "100%" },
});

function getProgressState(
  max: number,
  value: number,
  isComplete?: boolean,
): ProgressState {
  const normalizedMax = Number.isFinite(max) ? Math.max(0, max) : 0;
  const normalizedValue = Number.isFinite(value)
    ? Math.min(Math.max(0, value), normalizedMax)
    : 0;
  const complete =
    isComplete ?? (normalizedMax > 0 && normalizedValue >= normalizedMax);
  const percent =
    normalizedMax > 0 ? Math.round((normalizedValue / normalizedMax) * 100) : 0;
  return {
    complete,
    max: normalizedMax,
    percent,
    value: normalizedValue,
  };
}

function countFilledBlocks(state: ProgressState): number {
  if (state.max <= 0) return 0;
  const filled = Math.floor((state.value * BLOCKS.length) / state.max);
  return Math.min(Math.max(filled, 0), BLOCKS.length);
}

function resolveStatus({
  complete,
  currentLabel,
  isLoading,
  label,
  labels,
}: {
  readonly complete: boolean;
  readonly currentLabel?: string;
  readonly isLoading: boolean;
  readonly label?: ReactNode;
  readonly labels?: ProgressBarLabels;
}) {
  const statusLabel =
    plainText(label) ??
    currentLabel ??
    (complete
      ? (labels?.complete ?? "Complete")
      : (labels?.progress ?? "Progress"));
  if (!isLoading) return { loadingLabel: undefined, statusLabel };
  const loadingLabel = labels?.loading
    ? labels.loading(statusLabel)
    : `Loading ${statusLabel.toLowerCase()}`;
  return { loadingLabel, statusLabel };
}

function spokenProgress(
  state: ProgressState,
  loadingLabel: string | undefined,
  indeterminate: boolean,
) {
  if (loadingLabel !== undefined) return { text: loadingLabel };
  if (indeterminate) return { max: state.max, min: 0 };
  return {
    max: state.max,
    min: 0,
    now: state.value,
    text: `${state.percent}%`,
  };
}

function valueText({
  completedLabel,
  indeterminate,
  showValue,
  state,
  valueLabel,
}: {
  readonly completedLabel: string;
  readonly indeterminate: boolean;
  readonly showValue: boolean;
  readonly state: ProgressState;
  readonly valueLabel?: ReactNode;
}): ReactNode {
  if (valueLabel !== undefined) return valueLabel;
  if (indeterminate) return null;
  if (showValue) return `${state.percent}%`;
  return `${state.value} / ${state.max} ${completedLabel}`;
}

function ProgressLabels({
  label,
  loadingLabel,
  statusLabel,
  value,
}: {
  readonly label?: ReactNode;
  readonly loadingLabel?: string;
  readonly statusLabel: string;
  readonly value: ReactNode;
}) {
  return (
    <View style={styles.labelRow}>
      <Text size="small" weight="medium">
        {loadingLabel ?? label ?? statusLabel}
      </Text>
      {loadingLabel === undefined && value !== null ? (
        <Text size="small" tone="muted">
          {value}
        </Text>
      ) : null}
    </View>
  );
}
ProgressLabels.displayName = "ProgressLabels";

function IndeterminateFill({
  color,
  reducedMotionService,
}: {
  readonly color: string;
  readonly reducedMotionService?: ReducedMotionService;
}) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const sweep = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    sweep.stopAnimation();
    sweep.setValue(0);
    if (reduceMotion) return;
    const animation = Animated.loop(
      Animated.timing(sweep, {
        duration: SWEEP_MILLISECONDS,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [reduceMotion, sweep]);
  const left = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${INDETERMINATE_SHARE}%`, "100%"],
  });
  return (
    <Animated.View
      style={[
        styles.fill,
        {
          backgroundColor: color,
          borderRadius: theme.radius.full,
          left: reduceMotion ? 0 : left,
          width: `${INDETERMINATE_SHARE}%`,
        },
      ]}
    />
  );
}
IndeterminateFill.displayName = "IndeterminateFill";

type TrackFillProps = {
  readonly blocks: boolean;
  readonly fillColor: string;
  readonly filledBlocks: number;
  readonly indeterminate: boolean;
  readonly isLoading: boolean;
  readonly percent: number;
  readonly reducedMotionService?: ReducedMotionService;
};

function TrackFill({
  blocks,
  fillColor,
  filledBlocks,
  indeterminate,
  isLoading,
  percent,
  reducedMotionService,
}: TrackFillProps) {
  const theme = useTheme();
  if (indeterminate)
    return (
      <IndeterminateFill
        color={fillColor}
        reducedMotionService={reducedMotionService}
      />
    );
  if (blocks)
    return BLOCKS.map((block) => (
      <View
        key={block}
        style={[
          styles.block,
          {
            backgroundColor:
              block <= filledBlocks ? fillColor : theme.colors.muted,
          },
        ]}
      />
    ));
  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: fillColor,
          borderRadius: theme.radius.full,
          width: `${isLoading ? 0 : percent}%`,
        },
      ]}
    />
  );
}
TrackFill.displayName = "TrackFill";

function ProgressTrack({
  size,
  ...fill
}: TrackFillProps & { readonly size: ProgressBarSize }) {
  const theme = useTheme();
  const heights: Record<ProgressBarSize, number> = {
    lg: theme.spacing[3],
    md: theme.spacing[2],
    sm: theme.spacing[1],
  };
  const showBlocks = fill.blocks && !fill.indeterminate;
  return (
    <View
      {...decorativeProps}
      style={[
        styles.track,
        {
          backgroundColor: showBlocks ? "transparent" : theme.colors.muted,
          borderRadius: theme.radius.full,
          height: heights[size],
        },
        showBlocks ? [styles.blocks, { gap: theme.spacing[1] / 2 }] : undefined,
      ]}
    >
      <TrackFill {...fill} blocks={showBlocks} />
    </View>
  );
}
ProgressTrack.displayName = "ProgressTrack";

function cardSurface(
  theme: NativeTheme,
  tone: StatusTone,
  tinted: boolean,
): ViewStyle {
  const { colors, radius, spacing } = theme;
  const shape = {
    borderRadius: radius.md,
    gap: spacing[2],
    padding: spacing[4],
  };
  if (!tinted)
    return {
      ...shape,
      backgroundColor: colors.card,
      borderColor: colors.border,
    };
  if (tone === "neutral")
    return {
      ...shape,
      backgroundColor: withAlpha(colors.muted, 0.3),
      borderColor: colors.border,
    };
  const color = statusToneColor(theme, tone);
  return {
    ...shape,
    backgroundColor: withAlpha(color, 0.05),
    borderColor: withAlpha(color, 0.5),
  };
}

function resolveProgress({
  currentLabel,
  isComplete,
  isLoading,
  label,
  labels,
  max,
  mode,
  tone,
  value,
}: Pick<
  ProgressBarProps,
  | "currentLabel"
  | "isComplete"
  | "label"
  | "labels"
  | "max"
  | "mode"
  | "tone"
  | "value"
> & { readonly isLoading: boolean }) {
  const state = getProgressState(max, value, isComplete);
  const complete =
    mode === "indeterminate" ? isComplete === true : state.complete;
  return {
    complete,
    indeterminate: mode === "indeterminate" && !isLoading && !complete,
    state,
    tone: tone ?? (complete ? "success" : "primary"),
    ...resolveStatus({ complete, currentLabel, isLoading, label, labels }),
  };
}

type ProgressView = ReturnType<typeof resolveProgress>;

function accessibilityOf(
  view: ProgressView,
  {
    accessibilityLabel,
    accessibilityValue,
    isLoading,
  }: Pick<ProgressBarProps, "accessibilityLabel" | "accessibilityValue"> & {
    readonly isLoading: boolean;
  },
): Pick<
  ViewProps,
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessibilityState"
  | "accessibilityValue"
> {
  return {
    accessibilityLabel: accessibilityLabel ?? view.statusLabel,
    accessibilityRole: "progressbar",
    accessibilityState: { busy: isLoading || view.indeterminate },
    accessibilityValue:
      accessibilityValue ??
      spokenProgress(view.state, view.loadingLabel, view.indeterminate),
  };
}

function ProgressBody({
  blocks,
  completedLabel,
  isLoading,
  label,
  reducedMotionService,
  showLabels,
  showValue,
  size,
  valueLabel,
  view,
}: Pick<
  ProgressBarProps,
  "blocks" | "label" | "reducedMotionService" | "valueLabel"
> & {
  readonly completedLabel: string;
  readonly isLoading: boolean;
  readonly showLabels: boolean;
  readonly showValue: boolean;
  readonly size: ProgressBarSize;
  readonly view: ProgressView;
}) {
  const theme = useTheme();
  const { indeterminate, loadingLabel, state, statusLabel, tone } = view;
  return (
    <>
      {showLabels ? (
        <ProgressLabels
          label={label}
          loadingLabel={loadingLabel}
          statusLabel={statusLabel}
          value={valueText({
            completedLabel,
            indeterminate,
            showValue,
            state,
            valueLabel,
          })}
        />
      ) : null}
      <ProgressTrack
        blocks={blocks === true}
        fillColor={statusToneColor(theme, tone)}
        filledBlocks={isLoading || indeterminate ? 0 : countFilledBlocks(state)}
        indeterminate={indeterminate}
        isLoading={isLoading}
        percent={state.percent}
        reducedMotionService={reducedMotionService}
        size={size}
      />
    </>
  );
}
ProgressBody.displayName = "ProgressBody";

/**
 * Native progress bar with clamped values and React Native accessibility
 * state. `label`, `valueLabel`, `showValue`, `size`, `tone`, `mode` and
 * `blocks` take the web values and defaults.
 */
function ProgressBar({
  accessibilityLabel,
  accessibilityValue,
  blocks,
  completedLabel = "completed",
  currentLabel,
  isComplete,
  isLoading = false,
  label,
  labels,
  max,
  mode = "determinate",
  reducedMotionService,
  ref,
  showLabels = true,
  showValue = false,
  size = "md",
  style,
  tone,
  value,
  valueLabel,
  ...props
}: ProgressBarProps) {
  const theme = useTheme();
  const view = resolveProgress({
    currentLabel,
    isComplete,
    isLoading,
    label,
    labels,
    max,
    mode,
    tone,
    value,
  });

  return (
    <View
      {...props}
      {...accessibilityOf(view, {
        accessibilityLabel,
        accessibilityValue,
        isLoading,
      })}
      accessible
      ref={ref}
      style={[
        styles.root,
        cardSurface(theme, view.tone, view.complete && !isLoading),
        style,
      ]}
    >
      <ProgressBody
        blocks={blocks}
        completedLabel={completedLabel}
        isLoading={isLoading}
        label={label}
        reducedMotionService={reducedMotionService}
        showLabels={showLabels}
        showValue={showValue}
        size={size}
        valueLabel={valueLabel}
        view={view}
      />
    </View>
  );
}
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };

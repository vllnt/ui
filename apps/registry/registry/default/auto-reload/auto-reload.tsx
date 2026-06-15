"use client";

import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import { getCurrencyFormatter } from "@vllnt/ui";
import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";
import { Input } from "@vllnt/ui";
import { Switch } from "@vllnt/ui";

const CENTS_PER_UNIT = 100;
const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";
const DEFAULT_STEP_CENTS = 100;

/**
 * Snapshot passed to {@link AutoReloadProps.onSave}.
 *
 * @public
 */
export type AutoReloadSavePayload = {
  reloadAmountCents: number;
  thresholdCents: number;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type AutoReloadLabels = {
  /** Caption for the disabled banner. */
  disabledFallback?: string;
  /** Caption for the toggle headline. Defaults to `"Auto-reload"`. */
  heading?: string;
  /** Helper line under the toggle headline. Defaults to `"Automatically reload credits when balance is low."`. */
  helper?: string;
  /** Helper line under the reload-amount input. */
  reloadHelper?: string;
  /** Caption for the reload-amount input. Defaults to `"Reload amount"`. */
  reloadLabel?: string;
  /** Caption for the save button. Defaults to `"Save settings"`. */
  save?: string;
  /** Caption for the save button while saving. Defaults to `"Saving…"`. */
  saving?: string;
  /** Helper line under the threshold input. */
  thresholdHelper?: string;
  /** Caption for the threshold input. Defaults to `"Threshold"`. */
  thresholdLabel?: string;
};

const DEFAULT_LABELS = {
  disabledFallback: "Auto-reload is unavailable for this account.",
  heading: "Auto-reload",
  helper: "Automatically reload credits when balance is low.",
  reloadHelper: "Amount to add when the threshold is hit.",
  reloadLabel: "Reload amount",
  save: "Save settings",
  saving: "Saving…",
  thresholdHelper: "Reload when the balance drops below this.",
  thresholdLabel: "Threshold",
} as const satisfies Required<AutoReloadLabels>;

/**
 * Props for {@link AutoReload}.
 *
 * @public
 */
export type AutoReloadProps = {
  /** Currency code (ISO 4217). Defaults to `"USD"`. */
  currency?: string;
  /** Override the symbol displayed inside the inputs (e.g. `"€"`). */
  currencySymbol?: string;
  /** Initial enabled state when uncontrolled. */
  defaultEnabled?: boolean;
  /** Initial reload-amount value (cents) when uncontrolled. */
  defaultReloadAmountCents?: number;
  /** Initial threshold value (cents) when uncontrolled. */
  defaultThresholdCents?: number;
  /** When true, the consumer cannot interact with the control. */
  disabled?: boolean;
  /** Caption rendered with `disabled`. */
  disabledMessage?: ReactNode;
  /** Controlled enabled state. */
  enabled?: boolean;
  /** When true, the save button renders as loading + disabled. */
  isSaving?: boolean;
  /** Localizable strings. */
  labels?: AutoReloadLabels;
  /** BCP-47 locale tag. Defaults to `"en-US"`. */
  locale?: string;
  /** Highest allowed amount (cents). */
  maxAmountCents?: number;
  /** Lowest allowed amount (cents). Defaults to `100`. */
  minAmountCents?: number;
  /** Fires when the user clicks save. */
  onSave?: (payload: AutoReloadSavePayload) => void;
  /** Fires when the toggle changes. */
  onToggle?: (enabled: boolean) => void;
  /** Controlled reload-amount value (cents). */
  reloadAmountCents?: number;
  /** Step granularity for the inputs (cents). Defaults to `100`. */
  stepCents?: number;
  /** Controlled threshold value (cents). */
  thresholdCents?: number;
} & ComponentPropsWithoutRef<"div">;

function centsToValue(cents: number): string {
  return (cents / CENTS_PER_UNIT).toFixed(2);
}

function valueToCents(value: string): number {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * CENTS_PER_UNIT);
}

function getCurrencySymbol(locale: string, currency: string): string {
  const formatted = getCurrencyFormatter(locale, currency).format(0);
  const symbol = formatted.replaceAll(/[\d\s,.]/g, "");
  return symbol.length > 0 ? symbol : currency;
}

type ReloadFormProps = {
  currencyDisplay: string;
  isSaving: boolean;
  labels: Required<AutoReloadLabels>;
  maxAmountCents?: number;
  minAmountCents: number;
  onSave: () => void;
  reloadAmount: number;
  reloadAmountId: string;
  setReloadAmount: (value: number) => void;
  setThreshold: (value: number) => void;
  stepCents: number;
  threshold: number;
  thresholdId: string;
};

function ReloadFormFields({
  currencyDisplay,
  isSaving,
  labels,
  maxAmountCents,
  minAmountCents,
  onSave,
  reloadAmount,
  reloadAmountId,
  setReloadAmount,
  setThreshold,
  stepCents,
  threshold,
  thresholdId,
}: ReloadFormProps): ReactNode {
  const handleThreshold = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setThreshold(valueToCents(event.target.value));
    },
    [setThreshold],
  );
  const handleReload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setReloadAmount(valueToCents(event.target.value));
    },
    [setReloadAmount],
  );
  const step = (stepCents / CENTS_PER_UNIT).toFixed(2);
  const min = (minAmountCents / CENTS_PER_UNIT).toFixed(2);
  const max =
    maxAmountCents === undefined
      ? undefined
      : (maxAmountCents / CENTS_PER_UNIT).toFixed(2);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumericField
          currencyDisplay={currencyDisplay}
          helper={labels.thresholdHelper}
          id={thresholdId}
          label={labels.thresholdLabel}
          max={max}
          min={min}
          onChange={handleThreshold}
          step={step}
          value={centsToValue(threshold)}
        />
        <NumericField
          currencyDisplay={currencyDisplay}
          helper={labels.reloadHelper}
          id={reloadAmountId}
          label={labels.reloadLabel}
          max={max}
          min={min}
          onChange={handleReload}
          step={step}
          value={centsToValue(reloadAmount)}
        />
      </div>
      <div>
        <Button disabled={isSaving} onClick={onSave} type="button">
          {isSaving ? labels.saving : labels.save}
        </Button>
      </div>
    </div>
  );
}

type NumericFieldProps = {
  currencyDisplay: string;
  helper?: string;
  id: string;
  label: string;
  max?: string;
  min?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  step: string;
  value: string;
};

function NumericField({
  currencyDisplay,
  helper,
  id,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: NumericFieldProps): ReactNode {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label} ({currencyDisplay})
      </label>
      <Input
        id={id}
        inputMode="decimal"
        max={max}
        min={min}
        onChange={onChange}
        step={step}
        type="number"
        value={value}
      />
      {helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

type ToggleHeaderProps = {
  enabled: boolean;
  heading: string;
  helper: string;
  id: string;
  onCheckedChange: (next: boolean) => void;
};

function ToggleHeader({
  enabled,
  heading,
  helper,
  id,
  onCheckedChange,
}: ToggleHeaderProps): ReactNode {
  const helperId = `${id}-helper`;
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground" id={id}>
          {heading}
        </span>
        <span className="text-xs text-muted-foreground" id={helperId}>
          {helper}
        </span>
      </div>
      <Switch
        aria-describedby={helperId}
        aria-labelledby={id}
        checked={enabled}
        onCheckedChange={onCheckedChange}
      />
    </header>
  );
}

type ControllerOptions = {
  defaultEnabled: boolean;
  defaultReloadAmountCents: number;
  defaultThresholdCents: number;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  reloadAmountCents?: number;
  thresholdCents?: number;
};

type ControllerState = {
  enabled: boolean;
  handleToggle: (next: boolean) => void;
  reloadAmount: number;
  setReloadAmount: (value: number) => void;
  setThreshold: (value: number) => void;
  threshold: number;
};

function useAutoReloadController(options: ControllerOptions): ControllerState {
  const {
    defaultEnabled,
    defaultReloadAmountCents,
    defaultThresholdCents,
    enabled: controlledEnabled,
    onToggle,
    reloadAmountCents: controlledReload,
    thresholdCents: controlledThreshold,
  } = options;
  const [uncontrolledEnabled, setUncontrolledEnabled] =
    useState(defaultEnabled);
  const [threshold, setThreshold] = useState(defaultThresholdCents);
  const [reloadAmount, setReloadAmount] = useState(defaultReloadAmountCents);
  const enabled = controlledEnabled ?? uncontrolledEnabled;

  const handleToggle = useCallback(
    (next: boolean) => {
      if (controlledEnabled === undefined) setUncontrolledEnabled(next);
      onToggle?.(next);
    },
    [controlledEnabled, onToggle],
  );

  return {
    enabled,
    handleToggle,
    reloadAmount: controlledReload ?? reloadAmount,
    setReloadAmount,
    setThreshold,
    threshold: controlledThreshold ?? threshold,
  };
}

/**
 * Toggle + collapsible configuration form for automatic credit reloading.
 * Composes {@link Switch}, {@link Input}, and {@link Button}. Renders a
 * disabled banner when the consumer passes `disabled` so the control can
 * advertise itself before the user has access (e.g. before subscribing).
 *
 * Values flow through the component in **minor units** (cents). Inputs
 * display the corresponding currency unit; consumers receive the cents
 * value from `onSave`.
 *
 * @example
 * ```tsx
 * <AutoReload
 *   enabled={settings.autoReloadEnabled}
 *   thresholdCents={settings.thresholdCents}
 *   reloadAmountCents={settings.reloadAmountCents}
 *   currency="EUR"
 *   onToggle={handleToggle}
 *   onSave={handleSave}
 *   isSaving={isSaving}
 * />
 * ```
 *
 * @public
 */
type DisabledBannerProps = {
  className?: string;
  message: ReactNode;
} & ComponentPropsWithoutRef<"div">;

const DisabledBanner = forwardRef<HTMLDivElement, DisabledBannerProps>(
  ({ className, message, ...rest }, ref) => (
    <div
      aria-disabled="true"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground",
        className,
      )}
      ref={ref}
      {...rest}
    >
      {message}
    </div>
  ),
);
DisabledBanner.displayName = "AutoReload.DisabledBanner";

type ActivePanelProps = {
  className?: string;
  controller: ControllerState;
  currencyDisplay: string;
  isSaving: boolean;
  labels: Required<AutoReloadLabels>;
  maxAmountCents?: number;
  minAmountCents: number;
  onSave: () => void;
  reloadAmountId: string;
  stepCents: number;
  thresholdId: string;
  toggleId: string;
} & ComponentPropsWithoutRef<"div">;

const ActivePanel = forwardRef<HTMLDivElement, ActivePanelProps>(
  (props, ref) => {
    const {
      className,
      controller,
      currencyDisplay,
      isSaving,
      labels,
      maxAmountCents,
      minAmountCents,
      onSave,
      reloadAmountId,
      stepCents,
      thresholdId,
      toggleId,
      ...rest
    } = props;
    return (
      <div
        className={cn(
          "flex flex-col gap-4 rounded-2xl border bg-background p-4",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <ToggleHeader
          enabled={controller.enabled}
          heading={labels.heading}
          helper={labels.helper}
          id={toggleId}
          onCheckedChange={controller.handleToggle}
        />
        {controller.enabled ? (
          <ReloadFormFields
            currencyDisplay={currencyDisplay}
            isSaving={isSaving}
            labels={labels}
            maxAmountCents={maxAmountCents}
            minAmountCents={minAmountCents}
            onSave={onSave}
            reloadAmount={controller.reloadAmount}
            reloadAmountId={reloadAmountId}
            setReloadAmount={controller.setReloadAmount}
            setThreshold={controller.setThreshold}
            stepCents={stepCents}
            threshold={controller.threshold}
            thresholdId={thresholdId}
          />
        ) : null}
      </div>
    );
  },
);
ActivePanel.displayName = "AutoReload.ActivePanel";

type AutoReloadInternalState = {
  controller: ControllerState;
  currencyDisplay: string;
  handleSave: () => void;
  reloadAmountId: string;
  resolvedLabels: Required<AutoReloadLabels>;
  thresholdId: string;
  toggleId: string;
};

function useAutoReloadInternals(
  props: AutoReloadProps,
): AutoReloadInternalState {
  const {
    currency = DEFAULT_CURRENCY,
    currencySymbol,
    defaultEnabled = false,
    defaultReloadAmountCents = 2000,
    defaultThresholdCents = 1000,
    enabled: controlledEnabled,
    labels,
    locale = DEFAULT_LOCALE,
    onSave,
    onToggle,
    reloadAmountCents: controlledReload,
    thresholdCents: controlledThreshold,
  } = props;
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const toggleId = useId();
  const thresholdId = useId();
  const reloadAmountId = useId();
  const controller = useAutoReloadController({
    defaultEnabled,
    defaultReloadAmountCents,
    defaultThresholdCents,
    enabled: controlledEnabled,
    onToggle,
    reloadAmountCents: controlledReload,
    thresholdCents: controlledThreshold,
  });
  const currencyDisplay = currencySymbol ?? getCurrencySymbol(locale, currency);
  const handleSave = useCallback(() => {
    onSave?.({
      reloadAmountCents: controller.reloadAmount,
      thresholdCents: controller.threshold,
    });
  }, [controller.reloadAmount, controller.threshold, onSave]);
  return {
    controller,
    currencyDisplay,
    handleSave,
    reloadAmountId,
    resolvedLabels,
    thresholdId,
    toggleId,
  };
}

export const AutoReload = forwardRef<HTMLDivElement, AutoReloadProps>(
  (props, ref) => {
    const {
      className,
      disabled = false,
      disabledMessage,
      isSaving = false,
      maxAmountCents,
      minAmountCents = 100,
      stepCents = DEFAULT_STEP_CENTS,
    } = props;
    const internals = useAutoReloadInternals(props);
    if (disabled) {
      return (
        <DisabledBanner
          className={className}
          message={disabledMessage ?? internals.resolvedLabels.disabledFallback}
          ref={ref}
        />
      );
    }
    return (
      <ActivePanel
        className={className}
        controller={internals.controller}
        currencyDisplay={internals.currencyDisplay}
        isSaving={isSaving}
        labels={internals.resolvedLabels}
        maxAmountCents={maxAmountCents}
        minAmountCents={minAmountCents}
        onSave={internals.handleSave}
        ref={ref}
        reloadAmountId={internals.reloadAmountId}
        stepCents={stepCents}
        thresholdId={internals.thresholdId}
        toggleId={internals.toggleId}
      />
    );
  },
);
AutoReload.displayName = "AutoReload";

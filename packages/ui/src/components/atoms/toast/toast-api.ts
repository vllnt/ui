import {
  toast as sdkToast,
  type ToastDismissDetails,
  type ToastOptions,
  type ToastType,
} from "@ui-sdk/react/toast";
import type * as React from "react";

/**
 * The imperative `toast()` API, re-exported by the components barrel. It keeps
 * the call shape of sonner, which it replaces, on top of ui-sdk's toast.
 *
 * This module holds the toast queue and weighs about 4 KB. The `Toaster` that
 * shows the queue loads on demand, and a toast fired before it mounts waits.
 */

type ToastContent = (() => React.ReactNode) | React.ReactNode;
type ResultContent<TValue> =
  | ((value: TValue) => React.ReactNode)
  | ToastContent;
type ToastId = number | string;

type ToastButton = {
  label: React.ReactNode;
  /** Runs on a press of the button. `event.preventDefault()` on an action keeps the toast open. */
  onClick: (event: Event) => void;
};

type ToastReference = { id: ToastId };

type ToastClassNames = Partial<
  Record<
    | "actionButton"
    | "cancelButton"
    | "closeButton"
    | "content"
    | "default"
    | "description"
    | "error"
    | "icon"
    | "info"
    | "loading"
    | "success"
    | "title"
    | "toast"
    | "warning",
    string
  >
>;

/** How a toast looks. Also the shape of the `Toaster`'s `toastOptions`. */
type ToastAppearance = {
  className?: string;
  classNames?: ToastClassNames;
  closeButton?: boolean;
  descriptionClassName?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
};

type ExternalToast = ToastAppearance & {
  action?: ToastButton;
  cancel?: ToastButton;
  description?: ToastContent;
  dismissible?: boolean;
  /** How long it shows, in ms. `Infinity` keeps it until dismissed. */
  duration?: number;
  id?: ToastId;
  /** Runs when the toast closes by itself. */
  onAutoClose?: (toast: ToastReference) => void;
  /** Runs when the user or `toast.dismiss()` closes the toast. */
  onDismiss?: (toast: ToastReference) => void;
  /** How screen readers announce it: `polite` for every type, errors included, unless you set `assertive`. */
  priority?: "assertive" | "polite";
};

/** An `ExternalToast` with the id ui-sdk knows the toast by. */
type ResolvedToast = ExternalToast & { sdkId: string };

type PromiseData<TValue> = Omit<ExternalToast, "description"> & {
  /** Under the title. Given the settled value, once the promise settles. */
  description?: ResultContent<TValue>;
  error?: ResultContent<unknown>;
  /** Runs once the promise settles. */
  finally?: () => void;
  loading: ToastContent;
  success?: ResultContent<TValue>;
};

type PromiseHandle<TValue> = {
  id: string;
  /** The promise's own result: it resolves or rejects as the promise does. */
  unwrap: () => Promise<TValue>;
};

/** What the `Toaster` reads from a toast's `data`. */
type ToastExtras = ToastAppearance & { custom?: boolean };

const DEFAULT_DURATION = 4000;

let defaultDuration = DEFAULT_DURATION;
let counter = 0;

/** Sets how long toasts show unless they say otherwise. The `Toaster` calls it. */
function setDefaultToastDuration(duration: number | undefined) {
  defaultDuration = duration ?? DEFAULT_DURATION;
}

function resolveId(id: ToastId | undefined): string {
  return String(id ?? `vllnt-toast-${++counter}`);
}

function resolveContent(content: ToastContent): React.ReactNode {
  return typeof content === "function" ? content() : content;
}

function resolveResult<TValue>(
  content: ResultContent<TValue>,
  value: TValue,
): React.ReactNode {
  return typeof content === "function" ? content(value) : content;
}

function appearanceOf({
  className,
  classNames,
  closeButton,
  descriptionClassName,
  icon,
  style,
}: ExternalToast = {}): ToastAppearance {
  return {
    className,
    classNames,
    closeButton,
    descriptionClassName,
    icon,
    style,
  };
}

function toSdkButton(button: ToastButton) {
  return (event: Event | undefined) => {
    button.onClick(event ?? new Event("click"));
  };
}

function toOnDismiss({ id, onAutoClose, onDismiss, sdkId }: ResolvedToast) {
  const reference = { id: id ?? sdkId };

  return (details: ToastDismissDetails) => {
    if (details.reason === "action") {
      if (details.event?.defaultPrevented) {
        details.cancel();
      }
      return;
    }
    if (details.reason === "timeout") {
      onAutoClose?.(reference);
      return;
    }
    onDismiss?.(reference);
  };
}

function toSdkButtons({ action, cancel }: ExternalToast) {
  return {
    action: action && {
      label: action.label,
      onAction: toSdkButton(action),
    },
    cancel: cancel && {
      label: cancel.label,
      onCancel: toSdkButton(cancel),
    },
  };
}

function toSdkOptions(
  type: ToastType,
  title: React.ReactNode,
  options: ResolvedToast,
): ToastOptions<React.ReactNode> {
  const { description, dismissible, duration, priority, sdkId } = options;

  return {
    ...toSdkButtons(options),
    data: appearanceOf(options),
    description: resolveContent(description),
    dismissible,
    // A loading toast has no duration: it waits for an update or a dismiss.
    duration: type === "loading" ? undefined : (duration ?? defaultDuration),
    id: sdkId,
    onDismiss: toOnDismiss(options),
    // Sonner announced every toast with polite priority, errors included.
    priority: priority ?? "polite",
    title,
    type,
  };
}

function show(
  type: ToastType,
  title: ToastContent,
  options: ExternalToast = {},
): ToastId {
  const id = resolveId(options.id);
  sdkToast(
    toSdkOptions(type, resolveContent(title), { ...options, sdkId: id }),
  );
  return options.id ?? id;
}

function typed(type: ToastType) {
  return (title: ToastContent, options?: ExternalToast) =>
    show(type, title, options);
}

/** The loading, success and error toasts of a promise: one id, one toast. */
function promiseMessages<TValue>(data: PromiseData<TValue>, id: string) {
  const { error, loading, success, ...options } = data;
  // A description function needs the settled value, so it waits for success.
  const unsettled = {
    ...options,
    description:
      typeof options.description === "function"
        ? undefined
        : options.description,
    sdkId: id,
  };

  return {
    error:
      error === undefined
        ? undefined
        : (reason: unknown) =>
            toSdkOptions("error", resolveResult(error, reason), unsettled),
    loading: toSdkOptions("loading", resolveContent(loading), unsettled),
    success:
      success === undefined
        ? undefined
        : (value: TValue) =>
            toSdkOptions("success", resolveResult(success, value), {
              ...options,
              description: resolveResult(options.description, value),
              sdkId: id,
            }),
  };
}

function promise<TValue>(
  running: (() => Promise<TValue>) | Promise<TValue>,
  data: PromiseData<TValue>,
): PromiseHandle<TValue> {
  const started = typeof running === "function" ? running() : running;
  const id = resolveId(data.id);

  sdkToast.promise(started, promiseMessages(data, id));
  if (data.finally) {
    started.then(data.finally, data.finally);
  }

  return { id, unwrap: () => started };
}

function custom(
  render: (id: ToastId) => React.ReactNode,
  options: ExternalToast = {},
): ToastId {
  const id = resolveId(options.id);
  sdkToast({
    ...toSdkOptions("default", render(id), { ...options, sdkId: id }),
    data: { ...appearanceOf(options), custom: true } satisfies ToastExtras,
  });
  return options.id ?? id;
}

function dismiss(id?: ToastId): ToastId | undefined {
  sdkToast.dismiss(id === undefined ? undefined : String(id));
  return id;
}

const toast = /* @__PURE__ */ Object.assign(/* @__PURE__ */ typed("default"), {
  custom,
  dismiss,
  error: /* @__PURE__ */ typed("error"),
  info: /* @__PURE__ */ typed("info"),
  loading: /* @__PURE__ */ typed("loading"),
  message: /* @__PURE__ */ typed("default"),
  promise,
  success: /* @__PURE__ */ typed("success"),
  warning: /* @__PURE__ */ typed("warning"),
});

export {
  type ExternalToast,
  type PromiseData,
  type PromiseHandle,
  setDefaultToastDuration,
  toast,
  type ToastAppearance,
  type ToastButton,
  type ToastClassNames,
  type ToastContent,
  type ToastExtras,
  type ToastId,
  type ToastReference,
};

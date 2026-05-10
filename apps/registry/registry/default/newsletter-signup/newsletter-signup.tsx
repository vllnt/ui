"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useId,
  useReducer,
  useRef,
} from "react";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";
import { Input } from "@vllnt/ui";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Localizable strings for {@link NewsletterSignup}.
 *
 * @public
 */
export type NewsletterSignupLabels = {
  /** Caption when validation rejects the email. Defaults to a generic message. */
  emailInvalid?: string;
  /** Aria-label / fallback for the email input. Defaults to `"Email address"`. */
  emailLabel?: string;
  /** Generic error message when `onSubmit` rejects without a usable reason. Defaults to `"Something went wrong. Try again."`. */
  errorFallback?: string;
  /** Input placeholder. Defaults to `"you@example.com"`. */
  placeholder?: string;
  /** Caption while the submit promise is in flight. Defaults to `"Subscribing…"`. */
  sending?: string;
  /** Submit button label in idle state. Defaults to `"Subscribe"`. */
  submit?: string;
  /** Success caption shown after a successful submission. Defaults to `"You're on the list. Check your inbox to confirm."`. */
  success?: string;
  /** Caption for the retry control after an error. Defaults to `"Try again"`. */
  tryAgain?: string;
};

/**
 * Visual variant for {@link NewsletterSignup}.
 *
 * - `inline` — input + button on a single row (default).
 * - `stacked` — input above, full-width button below.
 *
 * @public
 */
export type NewsletterSignupVariant = "inline" | "stacked";

/**
 * Status reported to {@link NewsletterSignupProps.onStatusChange}.
 *
 * @public
 */
export type NewsletterSignupStatus = "error" | "idle" | "sending" | "sent";

const DEFAULT_LABELS = {
  emailInvalid: "Enter a valid email address.",
  emailLabel: "Email address",
  errorFallback: "Something went wrong. Try again.",
  placeholder: "you@example.com",
  sending: "Subscribing…",
  submit: "Subscribe",
  success: "You're on the list. Check your inbox to confirm.",
  tryAgain: "Try again",
} as const satisfies Required<NewsletterSignupLabels>;

type State =
  | { kind: "error"; message: string }
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" };

type Action =
  | { kind: "fail"; message: string }
  | { kind: "reset" }
  | { kind: "send" }
  | { kind: "succeed" };

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case "fail":
      return { kind: "error", message: action.message };

    case "reset":
      return { kind: "idle" };

    case "send":
      return state.kind === "sending" ? state : { kind: "sending" };

    case "succeed":
      return { kind: "sent" };
  }
}

function actionToStatus(action: Action): NewsletterSignupStatus {
  switch (action.kind) {
    case "fail":
      return "error";

    case "reset":
      return "idle";

    case "send":
      return "sending";

    case "succeed":
      return "sent";
  }
}

function defaultValidate(email: string, label: string): string | true {
  const trimmed = email.trim();
  if (!trimmed) return label;
  if (!EMAIL_PATTERN.test(trimmed)) return label;
  return true;
}

function extractErrorMessage(value: unknown, fallback: string): string {
  if (value instanceof Error && value.message) return value.message;
  if (typeof value === "string" && value.length > 0) return value;
  return fallback;
}

/**
 * Props for {@link NewsletterSignup}.
 *
 * @public
 */
export type NewsletterSignupProps = {
  /** Override the input's autocomplete attribute. Defaults to `"email"`. */
  autoComplete?: string;
  /** Localizable strings. */
  labels?: NewsletterSignupLabels;
  /** Fires whenever the internal status transitions. */
  onStatusChange?: (status: NewsletterSignupStatus) => void;
  /**
   * Submission handler. The component awaits the returned promise. Throw to
   * surface an error message — `Error` instances use their `message` and
   * thrown strings render verbatim; everything else falls back to
   * `labels.errorFallback`.
   */
  onSubmit: (email: string) => Promise<void> | void;
  /**
   * Optional custom validator. Return a string to render as the validation
   * error, or `true` for valid. Defaults to a basic email regex.
   */
  validate?: (email: string) => string | true;
  /** Visual variant. Defaults to `"inline"`. */
  variant?: NewsletterSignupVariant;
} & Omit<ComponentPropsWithoutRef<"form">, "onSubmit">;

type SubmitButtonProps = {
  labels: Required<NewsletterSignupLabels>;
  stacked: boolean;
  status: NewsletterSignupStatus;
};

function SubmitButton({
  labels,
  stacked,
  status,
}: SubmitButtonProps): ReactNode {
  let content: ReactNode;
  if (status === "sending") {
    content = (
      <>
        <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
        {labels.sending}
      </>
    );
  } else if (status === "error") {
    content = (
      <>
        <XCircle aria-hidden="true" className="mr-2 h-4 w-4" />
        {labels.tryAgain}
      </>
    );
  } else {
    content = labels.submit;
  }

  return (
    <Button
      className={stacked ? "w-full" : ""}
      disabled={status === "sending"}
      type="submit"
    >
      {content}
    </Button>
  );
}

type SuccessPanelProps = {
  className?: string;
  message: string;
};

function SuccessPanel({ className, message }: SuccessPanelProps): ReactNode {
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-900 dark:text-emerald-200",
        className,
      )}
      role="status"
    >
      <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Email-capture compound with a built-in state machine for the universal
 * "drop your email" pattern. Composes {@link Input} and {@link Button}.
 *
 * State machine: `idle → sending → sent | error`. `error → sending` when
 * the user retries; `error → idle` when they edit the input. Status
 * changes are also reported via `onStatusChange` so callers can drive
 * external UI off the same machine.
 *
 * @example
 * ```tsx
 * <NewsletterSignup
 *   onSubmit={async (email) => subscribe(email)}
 *   labels={{ submit: "Join", success: "Welcome aboard." }}
 * />
 * ```
 *
 * @public
 */
type SignupController = {
  errorMessage: null | string;
  handleChange: () => void;
  handleSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  status: NewsletterSignupStatus;
};

type ControllerOptions = {
  labels: Required<NewsletterSignupLabels>;
  onStatusChange?: (status: NewsletterSignupStatus) => void;
  onSubmit: (email: string) => Promise<void> | void;
  validate?: (email: string) => string | true;
};

function useNewsletterSignupController(
  options: ControllerOptions,
): SignupController {
  const { labels, onStatusChange, onSubmit, validate } = options;
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(reducer, { kind: "idle" });
  const status: NewsletterSignupStatus = state.kind;

  const transition = useCallback(
    (action: Action) => {
      dispatch(action);
      onStatusChange?.(actionToStatus(action));
    },
    [onStatusChange],
  );

  const handleChange = useCallback(() => {
    if (state.kind === "error") transition({ kind: "reset" });
  }, [state.kind, transition]);

  const performSubmit = useCallback(
    async (value: string) => {
      const validator =
        validate ??
        ((email: string) => defaultValidate(email, labels.emailInvalid));
      const validation = validator(value);
      if (validation !== true) {
        transition({ kind: "fail", message: validation });
        inputRef.current?.focus();
        return;
      }
      transition({ kind: "send" });
      try {
        await onSubmit(value);
        transition({ kind: "succeed" });
      } catch (error) {
        transition({
          kind: "fail",
          message: extractErrorMessage(error, labels.errorFallback),
        });
        inputRef.current?.focus();
      }
    },
    [labels.emailInvalid, labels.errorFallback, onSubmit, transition, validate],
  );

  const handleSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (state.kind === "sending") return;
      const value = inputRef.current?.value.trim() ?? "";
      void performSubmit(value);
    },
    [performSubmit, state.kind],
  );

  return {
    errorMessage: state.kind === "error" ? state.message : null,
    handleChange,
    handleSubmit,
    inputRef,
    status,
  };
}

export const NewsletterSignup = forwardRef<
  HTMLFormElement,
  NewsletterSignupProps
>((props, ref) => {
  const {
    autoComplete = "email",
    className,
    labels,
    onStatusChange,
    onSubmit,
    validate,
    variant = "inline",
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const inputId = useId();
  const errorId = useId();
  const controller = useNewsletterSignupController({
    labels: resolvedLabels,
    onStatusChange,
    onSubmit,
    validate,
  });

  if (controller.status === "sent") {
    return (
      <SuccessPanel className={className} message={resolvedLabels.success} />
    );
  }

  return (
    <FormBody
      autoComplete={autoComplete}
      className={className}
      errorId={errorId}
      formRef={ref}
      inputId={inputId}
      inputRef={controller.inputRef}
      labels={resolvedLabels}
      message={controller.errorMessage}
      onChange={controller.handleChange}
      onSubmit={controller.handleSubmit}
      rest={rest}
      stacked={variant === "stacked"}
      status={controller.status}
    />
  );
});
NewsletterSignup.displayName = "NewsletterSignup";

type FormBodyProps = {
  autoComplete: string;
  className?: string;
  errorId: string;
  formRef: React.ForwardedRef<HTMLFormElement>;
  inputId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  labels: Required<NewsletterSignupLabels>;
  message: null | string;
  onChange: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  rest: Omit<ComponentPropsWithoutRef<"form">, "onSubmit">;
  stacked: boolean;
  status: NewsletterSignupStatus;
};

function FormBody({
  autoComplete,
  className,
  errorId,
  formRef,
  inputId,
  inputRef,
  labels,
  message,
  onChange,
  onSubmit,
  rest,
  stacked,
  status,
}: FormBodyProps): ReactNode {
  return (
    <form
      aria-busy={status === "sending"}
      className={cn(
        "flex w-full",
        stacked
          ? "flex-col gap-2"
          : "flex-col gap-2 sm:flex-row sm:items-start",
        className,
      )}
      noValidate
      onSubmit={onSubmit}
      ref={formRef}
      {...rest}
    >
      <div className={cn("flex flex-col gap-1", stacked ? "" : "sm:flex-1")}>
        <label className="sr-only" htmlFor={inputId}>
          {labels.emailLabel}
        </label>
        <Input
          aria-describedby={message ? errorId : undefined}
          aria-invalid={message !== null}
          autoComplete={autoComplete}
          disabled={status === "sending"}
          id={inputId}
          name="email"
          onChange={onChange}
          placeholder={labels.placeholder}
          ref={inputRef}
          type="email"
        />
        <p
          aria-live="polite"
          className={cn("text-xs", message ? "text-destructive" : "sr-only")}
          id={errorId}
          role={message ? "alert" : undefined}
        >
          {message ?? ""}
        </p>
      </div>
      <SubmitButton labels={labels} stacked={stacked} status={status} />
    </form>
  );
}

export { reducer as newsletterSignupReducer };

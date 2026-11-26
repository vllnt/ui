"use client";

import * as React from "react";

import {
  Toast,
  ToastAction,
  ToastClose,
  type ToastData,
  ToastDescription,
  ToastRegion,
  ToastTitle,
} from "@ui-sdk/react/toast";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { cn } from "../../../lib/utils";

import type { ToastAppearance, ToastExtras } from "./toast-api";

type ToasterPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

type ToasterTheme = "dark" | "light" | "system";

type ToasterIcons = Partial<
  Record<"error" | "info" | "loading" | "success" | "warning", React.ReactNode>
>;

type ToasterProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "dir"
> & {
  closeButton?: boolean;
  /** The label of the notifications landmark. */
  containerAriaLabel?: string;
  /** How long toasts show, in ms, unless a toast says otherwise. */
  duration?: number;
  /** Keeps the stack open instead of collapsed. */
  expand?: boolean;
  icons?: ToasterIcons;
  /** The distance from the screen edge on wider screens: pixels as a number, or a CSS length. */
  offset?: number | string;
  position?: ToasterPosition;
  richColors?: boolean;
  theme?: ToasterTheme;
  /** What every toast gets, unless the toast sets it itself. */
  toastOptions?: ToastAppearance & { duration?: number };
  /** The most toasts that show at once. */
  visibleToasts?: number;
};

const DEFAULT_ICONS: ToasterIcons = {
  error: <OctagonXIcon className="size-4" />,
  info: <InfoIcon className="size-4" />,
  loading: (
    <Loader2Icon
      className="size-4 animate-spin motion-reduce:[animation-duration:1.5s]"
      data-motion="essential"
    />
  ),
  success: <CircleCheckIcon className="size-4" />,
  warning: <TriangleAlertIcon className="size-4" />,
};

// The page's colour tokens are bare oklch triplets (`--popover: 1 0 0`), so
// each needs the `oklch()` wrapper to be a colour the toast can paint with.
const BASE_VARIABLES = {
  "--border-radius": "var(--radius)",
  "--normal-bg": "oklch(var(--popover))",
  "--normal-border": "oklch(var(--border))",
  "--normal-text": "oklch(var(--popover-foreground))",
};

// The colors that follow the Toaster's `theme` prop rather than the page.
const PALETTES = {
  dark: {
    "--cancel-bg": "rgba(255, 255, 255, 0.3)",
    "--close-hover-bg": "hsl(0, 0%, 12%)",
    "--close-hover-border": "hsl(0, 0%, 25%)",
    "--description": "#e8e8e8",
    "--error-bg": "hsl(358, 76%, 10%)",
    "--error-border": "hsl(357, 89%, 16%)",
    "--error-text": "hsl(358, 100%, 81%)",
    "--info-bg": "hsl(215, 100%, 6%)",
    "--info-border": "hsl(223, 43%, 17%)",
    "--info-text": "hsl(216, 87%, 65%)",
    "--success-bg": "hsl(150, 100%, 6%)",
    "--success-border": "hsl(147, 100%, 12%)",
    "--success-text": "hsl(150, 86%, 65%)",
    "--warning-bg": "hsl(64, 100%, 6%)",
    "--warning-border": "hsl(60, 100%, 9%)",
    "--warning-text": "hsl(46, 87%, 65%)",
  },
  light: {
    "--cancel-bg": "rgba(0, 0, 0, 0.08)",
    "--close-hover-bg": "hsl(0, 0%, 97.3%)",
    "--close-hover-border": "hsl(0, 0%, 90.9%)",
    "--description": "#3f3f3f",
    "--error-bg": "hsl(359, 100%, 97%)",
    "--error-border": "hsl(359, 100%, 94%)",
    "--error-text": "hsl(360, 100%, 45%)",
    "--info-bg": "hsl(208, 100%, 97%)",
    "--info-border": "hsl(221, 91%, 93%)",
    "--info-text": "hsl(210, 92%, 45%)",
    "--success-bg": "hsl(143, 85%, 96%)",
    "--success-border": "hsl(145, 92%, 87%)",
    "--success-text": "hsl(140, 100%, 27%)",
    "--warning-bg": "hsl(49, 100%, 97%)",
    "--warning-border": "hsl(49, 91%, 84%)",
    "--warning-text": "hsl(31, 92%, 45%)",
  },
};

// Rich colors re-point the toast's own colors, and its close button's, not the
// action buttons'. The border color has its own property, apart from the
// `border` shorthand, as in sonner: a `--normal-border` that is not a color
// leaves no border, and rich colors do not bring it back. `!` keeps it ahead of
// the shorthand.
const RICH_COLORS: Record<string, string> = {
  error:
    "[--toast-bg:var(--error-bg)] [--toast-text:var(--error-text)] ![border-color:var(--error-border)] [&_[data-slot=toast-close]]:![border-color:var(--error-border)]",
  info: "[--toast-bg:var(--info-bg)] [--toast-text:var(--info-text)] ![border-color:var(--info-border)] [&_[data-slot=toast-close]]:![border-color:var(--info-border)]",
  success:
    "[--toast-bg:var(--success-bg)] [--toast-text:var(--success-text)] ![border-color:var(--success-border)] [&_[data-slot=toast-close]]:![border-color:var(--success-border)]",
  warning:
    "[--toast-bg:var(--warning-bg)] [--toast-text:var(--warning-text)] ![border-color:var(--warning-border)] [&_[data-slot=toast-close]]:![border-color:var(--warning-border)]",
};

const REGION_CLASS = cn(
  "toaster group group/toaster [font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe_UI,Roboto,Helvetica_Neue,Arial,Noto_Sans,sans-serif,Apple_Color_Emoji,Segoe_UI_Emoji,Segoe_UI_Symbol,Noto_Color_Emoji]",
  // Wider screens: a fixed-width column at the offset from the edge.
  "min-[601px]:w-[356px] min-[601px]:data-[align=start]:start-[var(--toaster-offset,24px)] min-[601px]:data-[align=end]:end-[var(--toaster-offset,24px)] min-[601px]:data-[side=bottom]:bottom-[var(--toaster-offset,24px)] min-[601px]:data-[side=top]:top-[var(--toaster-offset,24px)]",
  // Narrow screens: the full width, 16px from the edges.
  "max-[600px]:w-auto max-[600px]:[inset-inline:16px] max-[600px]:[translate:none] max-[600px]:data-[side=bottom]:bottom-4 max-[600px]:data-[side=top]:top-4",
);

// Toasts stack on top of each other: collapsed, the older ones peek out
// behind the newest, and expanded they sit in a column. `--y` holds where a
// toast rests, and starting and ending override it to slide in and out.
const STACK_CLASS = cn(
  "absolute inset-x-0 [--gap:14px] [--lift:-1] [--y:translateY(0)] [transform:var(--y)] [z-index:calc(var(--toast-count,1)-var(--toast-index,0))]",
  "group-data-[side=bottom]/toaster:bottom-0 group-data-[side=top]/toaster:top-0 group-data-[side=top]/toaster:[--lift:1]",
  "[&:not([data-expanded]):not([data-front])]:[--y:translateY(calc(var(--lift)*var(--gap)*var(--toast-index,0)))_scale(calc(1-var(--toast-index,0)*0.05))] [&:not([data-expanded]):not([data-front])]:h-[var(--toast-front-height,auto)] [&:not([data-expanded]):not([data-front])>*]:opacity-0",
  "data-[expanded]:[--y:translateY(calc(var(--lift)*(var(--toast-offset,0px)+var(--toast-index,0)*var(--gap))))] data-[expanded]:h-[var(--toast-height,auto)] data-[expanded]:after:absolute data-[expanded]:after:bottom-full data-[expanded]:after:left-0 data-[expanded]:after:h-[calc(var(--gap)+1px)] data-[expanded]:after:w-full data-[expanded]:after:content-['']",
  "data-[starting-style]:![--y:translateY(calc(var(--lift)*-100%))] data-[starting-style]:!opacity-0",
  "data-[ending-style]:![--y:translateY(calc(var(--lift)*-100%))] data-[ending-style]:!opacity-0 data-[ending-style]:data-[expanded]:![--y:translateY(calc(var(--lift)*(var(--toast-offset,0px)+var(--toast-index,0)*var(--gap))+var(--lift)*-100%))]",
  "data-[swiping]:[transform:var(--y)_translate(var(--toast-swipe-x,0px),var(--toast-swipe-y,0px))] data-[swiping]:transition-none",
  "[&>*]:[transition:opacity_.4s] [transition:transform_.4s,opacity_.4s,height_.4s,box-shadow_.2s] motion-reduce:!transition-none motion-reduce:[&>*]:!transition-none",
);

const TOAST_CLASS = cn(
  STACK_CLASS,
  "box-border flex items-center gap-1.5 rounded-[var(--border-radius)] [border:1px_solid_var(--normal-border)] bg-[color:var(--toast-bg,var(--normal-bg))] p-4 text-[13px] text-[color:var(--toast-text,var(--normal-text))] [box-shadow:0_4px_12px_rgba(0,0,0,.1)] outline-none [overflow-wrap:anywhere] focus-visible:[box-shadow:0_4px_12px_rgba(0,0,0,.1),0_0_0_2px_rgba(0,0,0,.2)]",
);

const BUTTON_CLASS =
  "ms-auto flex h-6 shrink-0 cursor-pointer items-center rounded-[4px] border-0 px-2 text-[12px] font-medium outline-none [transition:opacity_.4s,box-shadow_.2s] focus-visible:shadow-[0_0_0_2px_rgba(0,0,0,.4)]";

const ACTION_CLASS = cn(
  BUTTON_CLASS,
  "bg-[color:var(--normal-text)] text-[color:var(--normal-bg)]",
);

const CANCEL_CLASS = cn(
  BUTTON_CLASS,
  "bg-[color:var(--cancel-bg)] text-[color:var(--normal-text)]",
);

const CLOSE_CLASS =
  "absolute start-0 top-0 z-[1] flex size-5 cursor-pointer items-center justify-center rounded-full [border:1px_solid_var(--normal-border)] bg-[color:var(--toast-bg,var(--normal-bg))] p-0 text-[color:var(--toast-text,var(--normal-text))] outline-none [transform:translate(-35%,-35%)] [transition:opacity_.1s,background_.2s,border-color_.2s] hover:border-[color:var(--close-hover-border)] hover:bg-[color:var(--close-hover-bg)] focus-visible:[box-shadow:0_4px_12px_rgba(0,0,0,.1),0_0_0_2px_rgba(0,0,0,.2)] rtl:[transform:translate(35%,-35%)]";

const DARK_SCHEME = "(prefers-color-scheme: dark)";

function subscribeToScheme(onChange: () => void) {
  const query = window.matchMedia(DARK_SCHEME);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

const noop = (): void => undefined;

function ignoreScheme(): () => void {
  return noop;
}

/** `"system"` follows the page's color scheme; the others stay as they are. */
function useResolvedTheme(theme: ToasterTheme): "dark" | "light" {
  const following = theme === "system";
  const systemIsDark = React.useSyncExternalStore(
    following ? subscribeToScheme : ignoreScheme,
    () => following && window.matchMedia(DARK_SCHEME).matches,
    () => false,
  );
  if (following) {
    return systemIsDark ? "dark" : "light";
  }
  return theme;
}

function placeOf(position: ToasterPosition) {
  const [side, align] = position.split("-") as [
    "bottom" | "top",
    "center" | "left" | "right",
  ];
  return {
    align: ({ center: "center", left: "start", right: "end" } as const)[align],
    side,
  };
}

/** `data` is what `toast()` put there: `ToastExtras`, or nothing. */
function extrasOf(data: unknown): ToastExtras {
  return typeof data === "object" && data !== null ? data : {};
}

type ToastViewProps = {
  closeButton?: boolean;
  icons: ToasterIcons;
  richColors?: boolean;
  toast: ToastData<React.ReactNode>;
  toastOptions: ToastAppearance;
};

type Named = (name: keyof NonNullable<ToastAppearance["classNames"]>) => string;

type IconBoxProps = {
  className: string;
  icon: React.ReactNode;
  loading: boolean;
};

function IconBox({ className, icon, loading }: IconBoxProps) {
  return (
    <div
      className={cn(
        "relative -ms-[3px] me-1 flex size-4 shrink-0 items-center justify-start [&_svg]:-ms-px",
        className,
      )}
    >
      {loading ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {icon}
        </div>
      ) : (
        icon
      )}
    </div>
  );
}

type ButtonsProps = { named: Named; toast: ToastData<React.ReactNode> };

function Buttons({ named, toast }: ButtonsProps) {
  return (
    <>
      {toast.cancel ? (
        <ToastClose
          action={toast.cancel.onCancel}
          className={cn(CANCEL_CLASS, named("cancelButton"))}
        >
          {toast.cancel.label}
        </ToastClose>
      ) : null}
      {toast.action ? (
        <ToastAction className={cn(ACTION_CLASS, named("actionButton"))} />
      ) : null}
    </>
  );
}

function ToastView({
  closeButton,
  icons,
  richColors,
  toast,
  toastOptions,
}: ToastViewProps) {
  const extras = extrasOf(toast.data);
  const named: Named = (name) =>
    cn(toastOptions.classNames?.[name], extras.classNames?.[name]);
  const type = toast.type;
  const style = { ...toastOptions.style, ...extras.style };
  const classNames = [
    toastOptions.className,
    extras.className,
    named("toast"),
    named(type),
  ];

  if (extras.custom) {
    return (
      <Toast className={cn(STACK_CLASS, classNames)} style={style}>
        <ToastTitle />
      </Toast>
    );
  }

  const icon =
    extras.icon === undefined ? type !== "default" && icons[type] : extras.icon;
  const showClose =
    (extras.closeButton ?? toastOptions.closeButton ?? closeButton) &&
    type !== "loading";

  return (
    <Toast
      className={cn(TOAST_CLASS, richColors && RICH_COLORS[type], classNames)}
      style={style}
    >
      {showClose ? (
        <ToastClose
          aria-label="Close toast"
          className={cn(CLOSE_CLASS, named("closeButton"))}
        >
          <XIcon size={12} strokeWidth={1.5} />
        </ToastClose>
      ) : null}
      {icon ? (
        <IconBox
          className={named("icon")}
          icon={icon}
          loading={type === "loading" && extras.icon === undefined}
        />
      ) : null}
      <div
        className={cn("flex min-w-0 flex-1 flex-col gap-0.5", named("content"))}
      >
        <ToastTitle
          className={cn("font-medium leading-normal", named("title"))}
        />
        <ToastDescription
          className={cn(
            "font-normal leading-[1.4]",
            richColors ? "text-inherit" : "text-[color:var(--description)]",
            toastOptions.descriptionClassName,
            extras.descriptionClassName,
            named("description"),
          )}
        />
      </div>
      <Buttons named={named} toast={toast} />
    </Toast>
  );
}

const ToasterRegion = ({
  className,
  closeButton,
  containerAriaLabel = "Notifications",
  expand,
  icons,
  offset,
  position = "bottom-right",
  richColors,
  style,
  theme = "light",
  toastOptions = {},
  visibleToasts = 3,
  ...props
}: Omit<ToasterProps, "duration">) => {
  const resolvedTheme = useResolvedTheme(theme);
  const { align, side } = placeOf(position);
  const allIcons = { ...DEFAULT_ICONS, ...icons };

  return (
    <ToastRegion
      align={align}
      aria-label={containerAriaLabel}
      className={cn(REGION_CLASS, className)}
      expanded={expand}
      maxVisible={visibleToasts}
      shortcut="alt+t"
      side={side}
      style={{
        ...BASE_VARIABLES,
        ...PALETTES[resolvedTheme],
        ...(offset === undefined
          ? {}
          : {
              "--toaster-offset":
                typeof offset === "number" ? `${offset}px` : offset,
            }),
        ...style,
      }}
      {...props}
    >
      {(toast) => (
        <ToastView
          closeButton={closeButton}
          icons={allIcons}
          richColors={richColors}
          toast={toast}
          toastOptions={toastOptions}
        />
      )}
    </ToastRegion>
  );
};
ToasterRegion.displayName = "ToasterRegion";

export {
  type ToasterIcons,
  type ToasterPosition,
  type ToasterProps,
  ToasterRegion,
  type ToasterTheme,
};

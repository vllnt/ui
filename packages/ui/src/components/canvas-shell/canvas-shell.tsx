import { forwardRef } from "react";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "../../lib/utils";

import type { CanvasShellInsets } from "./canvas-shell-route-config";

export type CanvasShellProps = React.ComponentPropsWithoutRef<"section"> & {
  bottomBar?: ReactNode;
  bottomSlot?: ReactNode;
  children: ReactNode;
  chromeInset?: number | string;
  contentPadding?: CanvasShellInsets;
  leftBar?: ReactNode;
  leftRail?: ReactNode;
  rightBar?: ReactNode;
  rightDock?: ReactNode;
  topBar?: ReactNode;
};

type CanvasShellChromeProps = {
  bottomBar?: ReactNode;
  inset: string;
  leftBar?: ReactNode;
  rightBar?: ReactNode;
  topBar?: ReactNode;
};

function toInsetValue(value: number | string | undefined) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

function getSafeAreaInsets({
  chromeInset,
  contentPadding,
}: {
  chromeInset: number | string;
  contentPadding?: CanvasShellInsets;
}) {
  const inset = toInsetValue(chromeInset) ?? "16px";

  return {
    bottom: toInsetValue(contentPadding?.bottom) ?? inset,
    left: toInsetValue(contentPadding?.left) ?? inset,
    right: toInsetValue(contentPadding?.right) ?? inset,
    top: toInsetValue(contentPadding?.top) ?? inset,
  };
}

type CanvasShellSafeAreaStyle = CSSProperties & {
  "--canvas-shell-safe-bottom": string;
  "--canvas-shell-safe-left": string;
  "--canvas-shell-safe-right": string;
  "--canvas-shell-safe-top": string;
};

function getSafeAreaStyle(
  insets: ReturnType<typeof getSafeAreaInsets>,
): CanvasShellSafeAreaStyle {
  const safeAreaStyle = {
    "--canvas-shell-safe-bottom": insets.bottom,
    "--canvas-shell-safe-left": insets.left,
    "--canvas-shell-safe-right": insets.right,
    "--canvas-shell-safe-top": insets.top,
  } satisfies CanvasShellSafeAreaStyle;

  return safeAreaStyle;
}

function CanvasShellChrome({
  bottomBar,
  inset,
  leftBar,
  rightBar,
  topBar,
}: CanvasShellChromeProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {topBar ? (
        <div
          className="pointer-events-auto absolute left-1/2 z-30 w-[min(960px,calc(100%-32px))] -translate-x-1/2"
          style={{ top: inset }}
        >
          {topBar}
        </div>
      ) : null}
      {leftBar ? (
        <div
          className="pointer-events-auto absolute left-0 z-30 flex"
          style={{
            bottom: "var(--canvas-shell-safe-bottom)",
            left: inset,
            top: "var(--canvas-shell-safe-top)",
          }}
        >
          {leftBar}
        </div>
      ) : null}
      {rightBar ? (
        <div
          className="pointer-events-auto absolute right-0 z-30 flex"
          style={{
            bottom: "var(--canvas-shell-safe-bottom)",
            right: inset,
            top: "var(--canvas-shell-safe-top)",
          }}
        >
          {rightBar}
        </div>
      ) : null}
      {bottomBar ? (
        <div
          className="pointer-events-auto absolute bottom-0 left-1/2 z-30 w-[min(960px,calc(100%-32px))] -translate-x-1/2"
          style={{ bottom: inset }}
        >
          {bottomBar}
        </div>
      ) : null}
    </div>
  );
}

function renderLegacyCanvasShell(
  {
    bottomSlot,
    children,
    className,
    leftRail,
    rightDock,
    style,
    topBar,
    ...props
  }: CanvasShellProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  return (
    <section
      className={cn(
        "flex min-h-[720px] w-full flex-col overflow-hidden rounded-md border border-border bg-background",
        className,
      )}
      ref={ref}
      style={style}
      {...props}
    >
      {topBar}
      <div className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden bg-background">
        {leftRail ?? <div />}
        <div className="relative min-h-0 min-w-0 overflow-hidden">
          {children}
        </div>
        {rightDock ?? <div />}
      </div>
      {bottomSlot ? (
        <div className="border-t border-border bg-background px-4 py-2">
          {bottomSlot}
        </div>
      ) : null}
    </section>
  );
}

function renderFloatingCanvasShell(
  {
    bottomBar,
    children,
    chromeInset = 16,
    className,
    contentPadding,
    leftBar,
    rightBar,
    style,
    topBar,
    ...props
  }: CanvasShellProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const inset = toInsetValue(chromeInset) ?? "16px";
  const safeAreaInsets = getSafeAreaInsets({
    chromeInset,
    contentPadding,
  });
  const canvasSafeAreaStyle = getSafeAreaStyle(safeAreaInsets);
  const mergedStyle = {
    ...canvasSafeAreaStyle,
    ...style,
  } satisfies CSSProperties;
  const contentStyle = {
    paddingBottom: "var(--canvas-shell-safe-bottom)",
    paddingLeft: "var(--canvas-shell-safe-left)",
    paddingRight: "var(--canvas-shell-safe-right)",
    paddingTop: "var(--canvas-shell-safe-top)",
  } satisfies CSSProperties;

  return (
    <section
      className={cn(
        "relative isolate flex min-h-[720px] w-full overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--background)/0.94),hsl(var(--muted)/0.6))]",
        className,
      )}
      ref={ref}
      style={mergedStyle}
      {...props}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.94),hsl(var(--background)/0.8))]" />
      <div
        className="relative z-0 h-full w-full min-w-0 min-h-0"
        style={contentStyle}
      >
        <div className="h-full w-full min-w-0 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
      <CanvasShellChrome
        bottomBar={bottomBar}
        inset={inset}
        leftBar={leftBar}
        rightBar={rightBar}
        topBar={topBar}
      />
    </section>
  );
}

const CanvasShell = forwardRef<HTMLElement, CanvasShellProps>((props, ref) => {
  const {
    bottomBar,
    chromeInset = 16,
    contentPadding,
    leftBar,
    rightBar,
  } = props;
  const usesFloatingChrome =
    bottomBar !== undefined ||
    leftBar !== undefined ||
    rightBar !== undefined ||
    contentPadding !== undefined ||
    chromeInset !== 16;

  if (!usesFloatingChrome) {
    return renderLegacyCanvasShell(props, ref);
  }

  return renderFloatingCanvasShell(props, ref);
});

CanvasShell.displayName = "CanvasShell";

export { CanvasShell };

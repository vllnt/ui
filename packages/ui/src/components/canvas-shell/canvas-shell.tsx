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
  bottomBar,
  chromeInset,
  contentPadding,
  leftBar,
  rightBar,
  topBar,
}: {
  bottomBar?: ReactNode;
  chromeInset: number | string;
  contentPadding?: CanvasShellInsets;
  leftBar?: ReactNode;
  rightBar?: ReactNode;
  topBar?: ReactNode;
}) {
  const inset = toInsetValue(chromeInset) ?? "16px";

  return {
    bottom:
      toInsetValue(contentPadding?.bottom) ?? (bottomBar ? "112px" : inset),
    left: toInsetValue(contentPadding?.left) ?? (leftBar ? "112px" : inset),
    right: toInsetValue(contentPadding?.right) ?? (rightBar ? "392px" : inset),
    top: toInsetValue(contentPadding?.top) ?? (topBar ? "112px" : inset),
  };
}

function getSafeAreaStyle(insets: ReturnType<typeof getSafeAreaInsets>) {
  return {
    "--canvas-shell-safe-bottom": insets.bottom,
    "--canvas-shell-safe-left": insets.left,
    "--canvas-shell-safe-right": insets.right,
    "--canvas-shell-safe-top": insets.top,
  } as CSSProperties;
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

const CanvasShell = forwardRef<HTMLElement, CanvasShellProps>(
  (
    {
      bottomBar,
      bottomSlot,
      children,
      chromeInset = 16,
      className,
      contentPadding,
      leftBar,
      leftRail,
      rightBar,
      rightDock,
      style,
      topBar,
      ...props
    },
    ref,
  ) => {
    const resolvedBottomBar = bottomBar ?? bottomSlot;
    const resolvedLeftBar = leftBar ?? leftRail;
    const resolvedRightBar = rightBar ?? rightDock;
    const inset = toInsetValue(chromeInset) ?? "16px";
    const safeAreaInsets = getSafeAreaInsets({
      bottomBar: resolvedBottomBar,
      chromeInset,
      contentPadding,
      leftBar: resolvedLeftBar,
      rightBar: resolvedRightBar,
      topBar,
    });
    const canvasSafeAreaStyle = getSafeAreaStyle(safeAreaInsets);
    const mergedStyle = {
      ...canvasSafeAreaStyle,
      ...style,
    };
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
          bottomBar={resolvedBottomBar}
          inset={inset}
          leftBar={resolvedLeftBar}
          rightBar={resolvedRightBar}
          topBar={topBar}
        />
      </section>
    );
  },
);

CanvasShell.displayName = "CanvasShell";

export { CanvasShell };

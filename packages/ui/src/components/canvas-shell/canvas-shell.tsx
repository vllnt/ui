import { forwardRef } from "react";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "../../lib/utils";

import type { CanvasShellInsets } from "./canvas-shell-route-config";

export type CanvasShellProps = React.ComponentPropsWithoutRef<"section"> & {
  bottomBar?: ReactNode;
  bottomSlot?: ReactNode;
  children?: ReactNode;
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

type CanvasShellSafeAreaStyle = CSSProperties & {
  "--canvas-shell-safe-bottom": string;
  "--canvas-shell-safe-left": string;
  "--canvas-shell-safe-right": string;
  "--canvas-shell-safe-top": string;
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

function getSafeAreaStyle(
  insets: ReturnType<typeof getSafeAreaInsets>,
): CanvasShellSafeAreaStyle {
  return {
    "--canvas-shell-safe-bottom": insets.bottom,
    "--canvas-shell-safe-left": insets.left,
    "--canvas-shell-safe-right": insets.right,
    "--canvas-shell-safe-top": insets.top,
  } satisfies CanvasShellSafeAreaStyle;
}

const hasChromeContent = Boolean;

type CanvasShellChromeAfterProps = Pick<
  CanvasShellChromeProps,
  "bottomBar" | "inset" | "rightBar"
>;

function CanvasShellChromeBefore({
  inset,
  leftBar,
  topBar,
}: Pick<CanvasShellChromeProps, "inset" | "leftBar" | "topBar">) {
  return (
    <>
      {hasChromeContent(topBar) ? (
        <div
          className="pointer-events-none absolute inset-x-0 z-30"
          style={{ top: inset }}
        >
          <div
            className="pointer-events-auto mx-auto w-full max-w-[960px]"
            style={{ paddingLeft: inset, paddingRight: inset }}
          >
            {topBar}
          </div>
        </div>
      ) : null}
      {hasChromeContent(leftBar) ? (
        <div
          className="pointer-events-none absolute left-0 z-30 flex"
          style={{
            bottom: "var(--canvas-shell-safe-bottom)",
            left: inset,
            top: "var(--canvas-shell-safe-top)",
          }}
        >
          <div className="pointer-events-auto flex">{leftBar}</div>
        </div>
      ) : null}
    </>
  );
}

function CanvasShellChromeAfter({
  bottomBar,
  inset,
  rightBar,
}: CanvasShellChromeAfterProps) {
  return (
    <>
      {hasChromeContent(rightBar) ? (
        <div
          className="pointer-events-none absolute right-0 z-30 flex"
          style={{
            bottom: "var(--canvas-shell-safe-bottom)",
            right: inset,
            top: "var(--canvas-shell-safe-top)",
          }}
        >
          <div className="pointer-events-auto flex">{rightBar}</div>
        </div>
      ) : null}
      {hasChromeContent(bottomBar) ? (
        <div
          className="pointer-events-none absolute inset-x-0 z-30"
          style={{ bottom: inset }}
        >
          <div
            className="pointer-events-auto mx-auto w-full max-w-[960px]"
            style={{ paddingLeft: inset, paddingRight: inset }}
          >
            {bottomBar}
          </div>
        </div>
      ) : null}
    </>
  );
}

function renderLegacyCanvasShell(
  {
    bottomBar: _bottomBar,
    bottomSlot,
    children,
    chromeInset: _chromeInset = 16,
    className,
    contentPadding: _contentPadding,
    leftBar: _leftBar,
    leftRail,
    rightBar: _rightBar,
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

function renderFloatingContent(
  children: ReactNode,
  contentStyle: CSSProperties,
) {
  return (
    <div
      className="relative z-0 h-full w-full min-h-0 min-w-0"
      data-slot="canvas-shell-content"
      style={contentStyle}
    >
      <div className="h-full w-full min-h-0 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function renderFloatingCanvasShell(
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
  }: CanvasShellProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const inset = toInsetValue(chromeInset) ?? "16px";
  const safeAreaInsets = getSafeAreaInsets({
    chromeInset,
    contentPadding,
  });
  const mergedStyle = {
    ...getSafeAreaStyle(safeAreaInsets),
    ...style,
  } satisfies CSSProperties;
  const contentStyle = {
    paddingBottom: "var(--canvas-shell-safe-bottom)",
    paddingLeft: "var(--canvas-shell-safe-left)",
    paddingRight: "var(--canvas-shell-safe-right)",
    paddingTop: "var(--canvas-shell-safe-top)",
  } satisfies CSSProperties;
  const resolvedBottomBar = bottomBar ?? bottomSlot;
  const resolvedLeftBar = leftBar ?? leftRail;
  const resolvedRightBar = rightBar ?? rightDock;

  const hasTopBar = hasChromeContent(topBar);
  const hasLeftBar = hasChromeContent(resolvedLeftBar);
  const hasRightBar = hasChromeContent(resolvedRightBar);
  const hasBottomBar = hasChromeContent(resolvedBottomBar);

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
      <CanvasShellChromeBefore
        inset={inset}
        leftBar={hasLeftBar ? resolvedLeftBar : undefined}
        topBar={hasTopBar ? topBar : undefined}
      />
      {renderFloatingContent(children, contentStyle)}
      <CanvasShellChromeAfter
        bottomBar={hasBottomBar ? resolvedBottomBar : undefined}
        inset={inset}
        rightBar={hasRightBar ? resolvedRightBar : undefined}
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
  const hasExplicitChromeInset = Object.prototype.hasOwnProperty.call(
    props,
    "chromeInset",
  );
  const usesFloatingChrome =
    hasChromeContent(bottomBar) ||
    hasChromeContent(leftBar) ||
    hasChromeContent(rightBar) ||
    contentPadding !== undefined ||
    (hasExplicitChromeInset && chromeInset !== undefined);

  if (!usesFloatingChrome) {
    return renderLegacyCanvasShell(props, ref);
  }

  return renderFloatingCanvasShell(props, ref);
});

CanvasShell.displayName = "CanvasShell";

export { CanvasShell };

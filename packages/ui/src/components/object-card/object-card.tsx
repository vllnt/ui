import { forwardRef } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import { Button } from "../button";

export type ObjectCardMetric = {
  label: string;
  value: ReactNode;
};

export type ObjectCardAction = {
  label: string;
  onClick?: () => void;
};

export type ObjectCardProps = React.ComponentPropsWithoutRef<"article"> & {
  actions?: ObjectCardAction[];
  footer?: ReactNode;
  kind?: string;
  metrics?: ObjectCardMetric[];
  ports?: ReactNode;
  state?: "blocked" | "complete" | "idle" | "running";
  summary?: string;
  title: string;
};

const stateClasses: Record<NonNullable<ObjectCardProps["state"]>, string> = {
  blocked:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  complete:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  idle: "border-border/70 bg-muted/60 text-muted-foreground",
  running: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

function ObjectCardHeader({
  kind,
  ports,
  state,
  summary,
  title,
}: {
  kind: string;
  ports?: ReactNode;
  state: NonNullable<ObjectCardProps["state"]>;
  summary?: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="rounded-full border-border/60 bg-background/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            variant="outline"
          >
            {kind}
          </Badge>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
              stateClasses[state],
            )}
          >
            {state}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {summary ? (
            <p className="max-w-[32ch] text-sm leading-6 text-muted-foreground">
              {summary}
            </p>
          ) : null}
        </div>
      </div>
      {ports ? <div className="flex shrink-0 items-start">{ports}</div> : null}
    </div>
  );
}

function ObjectCardMetrics({ metrics }: Pick<ObjectCardProps, "metrics">) {
  if (!metrics?.length) {
    return null;
  }

  return (
    <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-background/75 p-3">
      {metrics.map((metric) => (
        <div className="space-y-1" key={metric.label}>
          <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {metric.label}
          </dt>
          <dd className="text-sm font-medium text-foreground">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ObjectCardActions({ actions }: Pick<ObjectCardProps, "actions">) {
  if (!actions?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const handleActionClick = () => {
          action.onClick?.();
        };

        return (
          <Button
            className="rounded-full"
            key={action.label}
            onClick={handleActionClick}
            size="sm"
            type="button"
            variant="outline"
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

const ObjectCard = forwardRef<HTMLElement, ObjectCardProps>(
  (
    {
      actions,
      children,
      className,
      footer,
      kind = "Object",
      metrics = [],
      ports,
      state = "idle",
      summary,
      title,
      ...props
    },
    ref,
  ) => (
    <article
      className={cn(
        "group relative flex min-w-[320px] max-w-[420px] flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.22))] p-5 shadow-[0_24px_80px_hsl(var(--foreground)/0.08)] transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
      data-state={state}
      ref={ref}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.22),transparent)]" />
      <ObjectCardHeader
        kind={kind}
        ports={ports}
        state={state}
        summary={summary}
        title={title}
      />
      <ObjectCardMetrics metrics={metrics} />
      {children ? <div className="space-y-3">{children}</div> : null}
      <ObjectCardActions actions={actions} />
      {footer ? (
        <div className="border-t border-border/60 pt-3 text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </article>
  ),
);

ObjectCard.displayName = "ObjectCard";

export { ObjectCard };

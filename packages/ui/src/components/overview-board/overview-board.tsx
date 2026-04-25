import { forwardRef } from "react";

import { AlertCircle, ArrowRight, Inbox, ListTodo, Siren } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

export type OverviewCardTone = "danger" | "default" | "warning";

export type OverviewCardProps = React.ComponentPropsWithoutRef<"section"> & {
  ctaLabel?: ReactNode;
  description: ReactNode;
  handleCtaClick?: () => void;
  heading: ReactNode;
  icon?: ReactNode;
  metric: ReactNode;
  tone?: OverviewCardTone;
};

const toneClassNames: Record<OverviewCardTone, string> = {
  danger: "border-red-500/30 bg-red-500/8",
  default: "border-border/70 bg-background/80",
  warning: "border-amber-500/30 bg-amber-500/8",
};

const toneAccentClassNames: Record<OverviewCardTone, string> = {
  danger: "text-red-600 dark:text-red-300",
  default: "text-primary",
  warning: "text-amber-600 dark:text-amber-300",
};

const OverviewCard = forwardRef<HTMLElement, OverviewCardProps>(
  (
    {
      className,
      ctaLabel,
      description,
      handleCtaClick,
      heading,
      icon,
      metric,
      tone = "default",
      ...props
    },
    ref,
  ) => (
    <section
      className={cn(
        "flex min-h-[172px] flex-col gap-4 rounded-2xl border p-5 shadow-[0_8px_30px_hsl(var(--foreground)/0.06)] backdrop-blur-xl",
        toneClassNames[tone],
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {heading}
          </div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">
            {metric}
          </div>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-background/80",
            toneAccentClassNames[tone],
          )}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      {ctaLabel ? (
        <div>
          <Button
            onClick={handleCtaClick}
            size="sm"
            type="button"
            variant="ghost"
          >
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : null}
    </section>
  ),
);

OverviewCard.displayName = "OverviewCard";

export type OverviewBoardItem = {
  ctaLabel?: ReactNode;
  description: ReactNode;
  handleCtaClick?: () => void;
  heading: ReactNode;
  icon?: ReactNode;
  id: string;
  metric: ReactNode;
  tone?: OverviewCardTone;
};

export type OverviewBoardProps = React.ComponentPropsWithoutRef<"section"> & {
  eyebrow?: ReactNode;
  heading: ReactNode;
  items: OverviewBoardItem[];
  subtitle?: ReactNode;
};

function getDefaultIcon(heading: ReactNode) {
  if (typeof heading !== "string") {
    return <Inbox className="size-5" />;
  }

  if (heading.toLowerCase().includes("error")) {
    return <AlertCircle className="size-5" />;
  }

  if (heading.toLowerCase().includes("action")) {
    return <ListTodo className="size-5" />;
  }

  if (heading.toLowerCase().includes("run")) {
    return <Siren className="size-5" />;
  }

  return <Inbox className="size-5" />;
}

const OverviewBoard = forwardRef<HTMLElement, OverviewBoardProps>(
  ({ className, eyebrow, heading, items, subtitle, ...props }, ref) => (
    <section
      className={cn("mx-auto flex w-full max-w-6xl flex-col gap-6", className)}
      ref={ref}
      {...props}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          {subtitle ? (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const handleCtaClick = item.handleCtaClick;

          return (
            <OverviewCard
              ctaLabel={item.ctaLabel}
              description={item.description}
              handleCtaClick={handleCtaClick}
              heading={item.heading}
              icon={item.icon ?? getDefaultIcon(item.heading)}
              key={item.id}
              metric={item.metric}
              tone={item.tone}
            />
          );
        })}
      </div>
    </section>
  ),
);

OverviewBoard.displayName = "OverviewBoard";

export { OverviewBoard, OverviewCard };

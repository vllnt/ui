import { forwardRef } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Check, LoaderCircle, X } from "lucide-react";

import { cn } from "../../lib/utils";

const markerVariants = cva(
  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
  {
    defaultVariants: {
      status: "pending",
    },
    variants: {
      status: {
        active: "border-primary bg-primary/10 text-primary",
        complete: "border-transparent bg-primary text-primary-foreground",
        error: "border-transparent bg-destructive text-destructive-foreground",
        pending: "border-border bg-muted text-muted-foreground",
      },
    },
  },
);

export type ChainOfThoughtStatus = NonNullable<
  VariantProps<typeof markerVariants>["status"]
>;

export type ChainOfThoughtStep = {
  /** Optional supporting detail shown under the title. */
  description?: string;
  /** Current status of the step. Defaults to "pending". */
  status?: ChainOfThoughtStatus;
  /** Short step title. */
  title: string;
};

export type ChainOfThoughtProps = {
  className?: string;
  /** Ordered steps to render. */
  steps: ChainOfThoughtStep[];
};

function StepMarkerIcon({
  index,
  status,
}: {
  index: number;
  status: ChainOfThoughtStatus;
}) {
  if (status === "complete") {
    return <Check className="size-3.5" />;
  }
  if (status === "error") {
    return <X className="size-3.5" />;
  }
  if (status === "active") {
    return <LoaderCircle className="size-3.5 animate-spin" />;
  }
  return <span>{index + 1}</span>;
}

function ChainOfThoughtItem({
  index,
  isLast,
  step,
}: {
  index: number;
  isLast: boolean;
  step: ChainOfThoughtStep;
}) {
  const status = step.status ?? "pending";

  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={markerVariants({ status })}>
          <StepMarkerIcon index={index} status={status} />
        </span>
        {isLast ? null : <span className="my-1 w-px flex-1 bg-border" />}
      </div>
      <div className={cn("pb-4", isLast && "pb-0")}>
        <p
          className={cn(
            "text-sm font-medium",
            status === "pending" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {step.title}
        </p>
        {step.description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {step.description}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Ordered, status-aware visualization of a model's chain of thought.
 *
 * Renders a numbered vertical step list where each step carries a status
 * ("pending" | "active" | "complete" | "error") reflected in its marker icon
 * and color. A vertical rail links the steps.
 *
 * @example
 * <ChainOfThought
 *   steps={[
 *     { status: "complete", title: "Read the file" },
 *     { status: "active", title: "Apply the edit" },
 *     { title: "Run the tests" },
 *   ]}
 * />
 */
export const ChainOfThought = forwardRef<HTMLOListElement, ChainOfThoughtProps>(
  ({ className, steps }, ref) => (
    <ol className={cn("flex flex-col", className)} ref={ref}>
      {steps.map((step, index) => (
        <ChainOfThoughtItem
          index={index}
          isLast={index === steps.length - 1}
          key={`${index}-${step.title}`}
          step={step}
        />
      ))}
    </ol>
  ),
);
ChainOfThought.displayName = "ChainOfThought";

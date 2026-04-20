import { Check, Circle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type StepperStep = {
  description?: string;
  id: string;
  meta?: string;
  title: string;
};

export type StepperProps = {
  className?: string;
  currentStep: number;
  onStepClick?: (step: StepperStep, stepIndex: number) => void;
  orientation?: "horizontal" | "vertical";
  showNumbers?: boolean;
  steps: StepperStep[];
};

type StepperItemProps = {
  index: number;
  isVertical: boolean;
  onStepClick?: (step: StepperStep, stepIndex: number) => void;
  showNumbers: boolean;
  step: StepperStep;
  stepState: "complete" | "current" | "upcoming";
  totalSteps: number;
};

function getStepState(
  index: number,
  currentStep: number,
): "complete" | "current" | "upcoming" {
  const stepNumber = index + 1;

  if (stepNumber < currentStep) return "complete";
  if (stepNumber === currentStep) return "current";
  return "upcoming";
}

function StepIcon({
  showNumbers,
  state,
  stepNumber,
}: {
  showNumbers: boolean;
  state: "complete" | "current" | "upcoming";
  stepNumber: number;
}): ReactNode {
  if (state === "complete") {
    return <Check className="h-4 w-4" />;
  }

  if (!showNumbers) {
    return <Circle className="h-3.5 w-3.5 fill-current stroke-none" />;
  }

  return <span className="text-xs font-semibold">{stepNumber}</span>;
}

function StepperItem({
  index,
  isVertical,
  onStepClick,
  showNumbers,
  step,
  stepState,
  totalSteps,
}: StepperItemProps): ReactNode {
  const clickable = Boolean(onStepClick);
  const stepNumber = index + 1;

  return (
    <li className={cn("relative", !isVertical && "min-w-0")}>
      {!isVertical && index < totalSteps - 1 ? (
        <div className="absolute left-[calc(50%+1rem)] right-[calc(-50%+1rem)] top-4 hidden h-px bg-border md:block" />
      ) : null}
      <button
        className={cn(
          "flex w-full items-start gap-3 rounded-lg text-left transition-colors",
          clickable
            ? "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            : "cursor-default",
          isVertical ? "p-2" : "flex-col items-start p-2 md:p-0",
        )}
        disabled={!clickable}
        onClick={() => {
          onStepClick?.(step, index);
        }}
        type="button"
      >
        <span
          aria-current={stepState === "current" ? "step" : undefined}
          className={cn(
            "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors",
            stepState === "complete" &&
              "border-primary bg-primary text-primary-foreground",
            stepState === "current" &&
              "border-primary bg-primary/10 text-primary shadow-sm",
            stepState === "upcoming" &&
              "border-border bg-background text-muted-foreground",
          )}
        >
          <StepIcon
            showNumbers={showNumbers}
            state={stepState}
            stepNumber={stepNumber}
          />
        </span>
        <span className="min-w-0 space-y-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {step.title}
            </span>
            {step.meta ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {step.meta}
              </span>
            ) : null}
          </span>
          {step.description ? (
            <span className="block text-sm text-muted-foreground">
              {step.description}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

export function Stepper({
  className,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  showNumbers = true,
  steps,
}: StepperProps): ReactNode {
  const isVertical = orientation === "vertical";

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={cn("my-6 rounded-xl border bg-card p-4", className)}>
      <ol
        className={cn("gap-3", isVertical ? "flex flex-col" : "grid gap-4")}
        style={
          isVertical
            ? undefined
            : { gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }
        }
      >
        {steps.map((step, index) => (
          <StepperItem
            index={index}
            isVertical={isVertical}
            key={step.id}
            onStepClick={onStepClick}
            showNumbers={showNumbers}
            step={step}
            stepState={getStepState(index, currentStep)}
            totalSteps={steps.length}
          />
        ))}
      </ol>
    </div>
  );
}

"use client";

import { useState } from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../card";

export type TourStep = {
  badge?: string;
  description: ReactNode;
  hint?: ReactNode;
  id: string;
  media?: ReactNode;
  title: string;
};

export type TourProps = {
  className?: string;
  defaultStep?: number;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number, step: TourStep) => void;
  steps: TourStep[];
};

type TourHeaderProps = {
  progress: number;
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
};

function TourHeader({
  progress,
  step,
  stepIndex,
  totalSteps,
}: TourHeaderProps): ReactNode {
  return (
    <CardHeader className="gap-4 border-b bg-background/70">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Tour</Badge>
            {step.badge ? <Badge variant="outline">{step.badge}</Badge> : null}
          </div>
          <CardTitle>{step.title}</CardTitle>
        </div>
        <span className="text-sm text-muted-foreground">
          {stepIndex + 1}/{totalSteps}
        </span>
      </div>
      <div className="h-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </CardHeader>
  );
}

type TourFooterProps = {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onComplete?: () => void;
  onStepSelect: (stepIndex: number) => void;
  steps: TourStep[];
};

function TourFooter({
  currentStep,
  isFirstStep,
  isLastStep,
  onComplete,
  onStepSelect,
  steps,
}: TourFooterProps): ReactNode {
  return (
    <CardFooter className="flex items-center justify-between gap-3 border-t bg-background/70 px-6 py-4">
      <Button
        disabled={isFirstStep}
        onClick={() => {
          onStepSelect(currentStep - 1);
        }}
        variant="outline"
      >
        Previous
      </Button>
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <button
            aria-label={`Go to ${step.title}`}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              index === currentStep ? "bg-primary" : "bg-muted-foreground/30",
            )}
            key={step.id}
            onClick={() => {
              onStepSelect(index);
            }}
            type="button"
          />
        ))}
      </div>
      {isLastStep ? (
        <Button
          onClick={() => {
            onComplete?.();
          }}
        >
          Finish
        </Button>
      ) : (
        <Button
          onClick={() => {
            onStepSelect(currentStep + 1);
          }}
        >
          Next
        </Button>
      )}
    </CardFooter>
  );
}

export function Tour({
  className,
  defaultStep = 0,
  onComplete,
  onStepChange,
  steps,
}: TourProps): ReactNode {
  const [currentStep, setCurrentStep] = useState(defaultStep);

  if (steps.length === 0) {
    return null;
  }

  const activeStep = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!activeStep) {
    return null;
  }

  const handleStepSelect = (stepIndex: number): void => {
    const nextStep = steps[stepIndex];

    if (!nextStep) {
      return;
    }

    setCurrentStep(stepIndex);
    onStepChange?.(stepIndex, nextStep);
  };

  return (
    <Card
      className={cn(
        "my-6 overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5",
        className,
      )}
    >
      <TourHeader
        progress={progress}
        step={activeStep}
        stepIndex={currentStep}
        totalSteps={steps.length}
      />
      <CardContent className="space-y-4 p-6">
        {activeStep.media ? (
          <div className="rounded-lg border bg-card p-4">
            {activeStep.media}
          </div>
        ) : null}
        <div className="text-sm text-muted-foreground [&>p]:mb-3">
          {activeStep.description}
        </div>
        {activeStep.hint ? (
          <div className="rounded-lg border border-dashed bg-muted/50 p-3 text-sm text-muted-foreground">
            {activeStep.hint}
          </div>
        ) : null}
      </CardContent>
      <TourFooter
        currentStep={currentStep}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onComplete={onComplete}
        onStepSelect={handleStepSelect}
        steps={steps}
      />
    </Card>
  );
}

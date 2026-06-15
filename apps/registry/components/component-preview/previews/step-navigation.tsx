"use client";

import * as React from "react";

import { StepNavigation } from "@vllnt/ui";

export default function StepNavigationPreview() {
  const [step, setStep] = React.useState(2);
  return (
    <StepNavigation
      canNext={step < 5}
      canPrev={step > 1}
      currentStep={step}
      onNext={() => {
        setStep((currentStep) => currentStep + 1);
      }}
      onPrev={() => {
        setStep((currentStep) => currentStep - 1);
      }}
      stepLabel="Step"
      totalSteps={5}
    />
  );
}

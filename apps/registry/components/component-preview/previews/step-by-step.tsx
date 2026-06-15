"use client";

import { Step, StepByStep } from "@vllnt/ui";

export default function StepByStepPreview() {
  return (
    <StepByStep title="Getting Started">
      <Step title="Install">Run npm install to install dependencies.</Step>
      <Step title="Configure">Set up your configuration files.</Step>
      <Step title="Build">Build your application for production.</Step>
    </StepByStep>
  );
}

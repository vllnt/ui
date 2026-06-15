"use client";

import * as React from "react";

import { LearningObjectives, Prerequisites, Summary } from "@vllnt/ui";

export default function LearningObjectivesPreview() {
  return (
    <div className="space-y-4">
      <LearningObjectives
        estimatedTime="30 min"
        objectives={[
          "Understand React components",
          "Learn about props and state",
          "Build your first component",
        ]}
      />
      <Prerequisites
        items={["Basic JavaScript knowledge", "HTML/CSS fundamentals"]}
        level="beginner"
      />
      <Summary keyTakeaways={["Components are reusable", "Props flow down"]}>
        <p>We covered the basics of React components.</p>
      </Summary>
    </div>
  );
}

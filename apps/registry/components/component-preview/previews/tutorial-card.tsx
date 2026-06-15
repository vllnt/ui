"use client";

import * as React from "react";

import { TutorialCard } from "@vllnt/ui";

export default function TutorialCardPreview() {
  return (
    <TutorialCard
      href="/tutorials/react-basics"
      labels={{
        completed: "completed",
        difficulty: {
          advanced: "Advanced",
          beginner: "Beginner",
          intermediate: "Intermediate",
        },
        sectionsCount: "sections",
      }}
      tutorial={{
        description: "Learn React fundamentals",
        difficulty: "beginner",
        estimatedTime: "2 hours",
        id: "react-basics",
        sectionCount: 5,
        tags: ["react", "javascript"],
        title: "React Basics",
      }}
    />
  );
}

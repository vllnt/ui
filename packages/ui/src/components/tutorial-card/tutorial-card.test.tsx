import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  TutorialCard,
  type TutorialCardLabels,
  type TutorialCardMeta,
} from "./tutorial-card";

const labels: TutorialCardLabels = {
  completed: "completed",
  difficulty: {
    advanced: "Advanced",
    beginner: "Beginner",
    intermediate: "Intermediate",
  },
  sectionsCount: "sections",
};

const tutorial: TutorialCardMeta = {
  description: "Learn the basics.",
  difficulty: "beginner",
  estimatedTime: "30 min",
  id: "canvas-basics",
  sectionCount: 6,
  tags: ["canvas", "interaction"],
  title: "Canvas basics",
};

describe("TutorialCard", () => {
  it("renders title + description", () => {
    render(
      <TutorialCard
        href="/tutorials/canvas-basics"
        labels={labels}
        tutorial={tutorial}
      />,
    );

    expect(screen.getByText("Canvas basics")).toBeInTheDocument();
    expect(screen.getByText("Learn the basics.")).toBeInTheDocument();
  });

  it("renders difficulty + estimated time + section count", () => {
    render(
      <TutorialCard
        href="/tutorials/canvas-basics"
        labels={labels}
        tutorial={tutorial}
      />,
    );

    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
    expect(screen.getByText(/6 sections/)).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(
      <TutorialCard
        href="/tutorials/canvas-basics"
        labels={labels}
        tutorial={tutorial}
      />,
    );

    expect(screen.getByText("canvas")).toBeInTheDocument();
    expect(screen.getByText("interaction")).toBeInTheDocument();
  });

  it("wraps the card in an anchor pointing at href", () => {
    render(
      <TutorialCard
        href="/tutorials/canvas-basics"
        labels={labels}
        tutorial={tutorial}
      />,
    );

    expect(screen.getByText("Canvas basics").closest("a")).toHaveAttribute(
      "href",
      "/tutorials/canvas-basics",
    );
  });
});

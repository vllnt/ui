import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";

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
  it("renders title, description, meta, and tags inside an anchor pointing at href", () => {
    render(
      <TutorialCard
        href="/tutorials/canvas-basics"
        labels={labels}
        tutorial={tutorial}
      />,
    );
    expect(screen.getByText("Canvas basics")).toBeInTheDocument();
    expect(screen.getByText("Learn the basics.")).toBeInTheDocument();
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
    expect(screen.getByText(/6 sections/)).toBeInTheDocument();
    expect(screen.getByText("canvas")).toBeInTheDocument();
    expect(screen.getByText("interaction")).toBeInTheDocument();
    expect(screen.getByText("Canvas basics").closest("a")).toHaveAttribute(
      "href",
      "/tutorials/canvas-basics",
    );
  });
});

describe("TutorialCard progress loading", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cancels the pending frame on unmount", () => {
    const frames = stubAnimationFrame();
    const { unmount } = render(
      <TutorialCard
        getProgress={() => ({ completedCount: 2, totalSections: 6 })}
        href="/tutorials/canvas-basics"
        labels={labels}
        tutorial={tutorial}
      />,
    );
    expect(frames.pending()).toBe(1);

    unmount();

    expect(frames.pending()).toBe(0);
  });
});

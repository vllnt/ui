import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  LearningObjectives,
  Prerequisites,
  Summary,
} from "./learning-objectives";

describe("LearningObjectives", () => {
  it("renders the default title and one entry per objective", () => {
    render(<LearningObjectives objectives={["Pan", "Zoom", "Drag"]} />);

    expect(screen.getByText("What you'll learn")).toBeInTheDocument();
    expect(screen.getByText("Pan")).toBeInTheDocument();
    expect(screen.getByText("Zoom")).toBeInTheDocument();
    expect(screen.getByText("Drag")).toBeInTheDocument();
  });

  it("uses the override title when provided", () => {
    render(<LearningObjectives objectives={["x"]} title="Outcomes" />);

    expect(screen.getByText("Outcomes")).toBeInTheDocument();
  });

  it("renders the optional estimated time", () => {
    render(<LearningObjectives estimatedTime="30 min" objectives={["x"]} />);

    expect(screen.getByText("30 min")).toBeInTheDocument();
  });
});

describe("Prerequisites", () => {
  it("renders items + optional level chip", () => {
    render(
      <Prerequisites items={["TypeScript", "React"]} level="intermediate" />,
    );

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("intermediate")).toBeInTheDocument();
  });
});

describe("Summary", () => {
  it("renders children + key takeaways", () => {
    render(
      <Summary keyTakeaways={["Calm by default", "Composable"]}>
        <p>Body text.</p>
      </Summary>,
    );

    expect(screen.getByText("Body text.")).toBeInTheDocument();
    expect(screen.getByText("Calm by default")).toBeInTheDocument();
    expect(screen.getByText("Composable")).toBeInTheDocument();
    expect(screen.getByText("Key Takeaways")).toBeInTheDocument();
  });

  it("hides the key-takeaways block when none are provided", () => {
    render(
      <Summary>
        <p>Body</p>
      </Summary>,
    );

    expect(screen.queryByText("Key Takeaways")).not.toBeInTheDocument();
  });
});

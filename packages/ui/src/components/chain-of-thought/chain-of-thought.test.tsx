import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChainOfThought, type ChainOfThoughtStep } from "./chain-of-thought";

const STEPS: ChainOfThoughtStep[] = [
  { status: "complete", title: "Read the file" },
  { status: "active", title: "Apply the edit" },
  { title: "Run the tests" },
];

describe("ChainOfThought", () => {
  describe("rendering", () => {
    it("renders correctly", () => {
      const { container } = render(<ChainOfThought steps={STEPS} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <ChainOfThought className="custom-class" steps={STEPS} />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("renders one list item per step", () => {
      render(<ChainOfThought steps={STEPS} />);

      expect(screen.getAllByRole("listitem")).toHaveLength(STEPS.length);
    });

    it("renders titles and descriptions", () => {
      render(
        <ChainOfThought
          steps={[{ description: "loaded index.ts", title: "Read the file" }]}
        />,
      );

      expect(screen.getByText("Read the file")).toBeInTheDocument();
      expect(screen.getByText("loaded index.ts")).toBeInTheDocument();
    });

    it("numbers pending steps", () => {
      render(<ChainOfThought steps={[{ title: "Only step" }]} />);

      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("renders an ordered list", () => {
      const { container } = render(<ChainOfThought steps={STEPS} />);

      expect(container.querySelector("ol")).toBeInTheDocument();
    });
  });
});

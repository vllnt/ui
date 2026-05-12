import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContentIntro, type ContentIntroSection } from "./content-intro";

const sections: ContentIntroSection[] = [
  { id: "setup", title: "Set up the workspace" },
  { id: "ship", title: "Ship the first flow" },
];

const baseProps = {
  completedSections: new Set<string>(),
  estimatedTime: "12 min",
  onGoToSection: vi.fn(),
  onStart: vi.fn(),
  renderIntroContent: () => <p>Read the framing first.</p>,
  sections,
  title: "Build a tutorial",
};

describe("ContentIntro", () => {
  it("renders the intro content and table of contents", () => {
    render(<ContentIntro {...baseProps} />);

    expect(screen.getByText("Build a tutorial")).toBeInTheDocument();
    expect(screen.getByText("Read the framing first.")).toBeInTheDocument();
    expect(screen.getByText("Set up the workspace")).toBeInTheDocument();
    expect(screen.getByText("Ship the first flow")).toBeInTheDocument();
  });

  it("calls onGoToSection with the clicked section index", () => {
    const handleGoToSection = vi.fn();
    render(<ContentIntro {...baseProps} onGoToSection={handleGoToSection} />);

    fireEvent.click(screen.getByText("Ship the first flow"));

    expect(handleGoToSection).toHaveBeenCalledWith(1);
  });

  it("shows progress and continue copy when sections are completed", () => {
    render(
      <ContentIntro
        {...baseProps}
        completedSections={new Set(["setup"])}
        labels={{ continueLabel: "Keep going" }}
      />,
    );

    expect(screen.getByText("1/2 completed")).toBeInTheDocument();
    expect(screen.getByText("Keep going")).toBeInTheDocument();
    expect(screen.getByText("Set up the workspace")).toHaveClass(
      "line-through",
    );
  });

  it("calls onStart from the primary button and Enter shortcut", () => {
    const handleStart = vi.fn();
    render(<ContentIntro {...baseProps} onStart={handleStart} />);

    fireEvent.click(screen.getByText("Start Tutorial"));
    fireEvent.keyDown(document, { key: "Enter" });

    expect(handleStart).toHaveBeenCalledTimes(2);
  });

  it("renders additional content when supplied", () => {
    render(
      <ContentIntro
        {...baseProps}
        additionalContent={<aside>Author notes</aside>}
      />,
    );

    expect(screen.getByText("Author notes")).toBeInTheDocument();
  });
});

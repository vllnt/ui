import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slideshow } from "./slideshow";

const defaultProps = {
  completedSections: new Set<string>(),
  currentIndex: 0,
  onComplete: vi.fn(),
  onExit: vi.fn(),
  onNavigate: vi.fn(),
  onToggleSection: vi.fn(),
  sections: [{ id: "intro", title: "Introduction" }],
  title: "Tutorial Slideshow",
};

describe("Slideshow", () => {
  it("renders section content from the legacy renderContent prop", () => {
    render(
      <Slideshow
        {...defaultProps}
        renderContent={(section) => <p>Legacy content for {section.title}</p>}
      />,
    );

    expect(
      screen.getByText("Legacy content for Introduction"),
    ).toBeInTheDocument();
  });

  it("prefers SectionContent over the legacy renderContent prop", () => {
    render(
      <Slideshow
        {...defaultProps}
        renderContent={() => <p>Legacy content</p>}
        SectionContent={({ section }) => <p>New content for {section.title}</p>}
      />,
    );

    expect(
      screen.getByText("New content for Introduction"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Legacy content")).not.toBeInTheDocument();
  });
});

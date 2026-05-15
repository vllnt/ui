import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContentIntro } from "./content-intro";

const defaultProps = {
  completedSections: new Set<string>(),
  estimatedTime: "10 min",
  onGoToSection: vi.fn(),
  onStart: vi.fn(),
  sections: [{ id: "intro", title: "Introduction" }],
  title: "Getting Started",
};

describe("ContentIntro", () => {
  it("renders introduction content from the legacy renderIntroContent prop", () => {
    render(
      <ContentIntro
        {...defaultProps}
        renderIntroContent={() => <p>Legacy introduction</p>}
      />,
    );

    expect(screen.getByText("Legacy introduction")).toBeInTheDocument();
  });

  it("prefers introContent over the legacy renderIntroContent prop", () => {
    render(
      <ContentIntro
        {...defaultProps}
        introContent={<p>New introduction</p>}
        renderIntroContent={() => <p>Legacy introduction</p>}
      />,
    );

    expect(screen.getByText("New introduction")).toBeInTheDocument();
    expect(screen.queryByText("Legacy introduction")).not.toBeInTheDocument();
  });
});

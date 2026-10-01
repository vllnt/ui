import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContentCard } from "./progress-card";

describe("ProgressCard ContentCard", () => {
  it("renders title, description, badge, metadata and tags inside an anchor to href", () => {
    render(
      <ContentCard
        badgeLabel="Tutorial"
        description="Pan, zoom, drag."
        href="/tutorials/canvas-basics"
        metadata={["30 min", "10 sections"]}
        tags={["canvas", "interaction"]}
        title="Canvas basics"
      />,
    );
    expect(screen.getByText("Canvas basics").closest("a")).toHaveAttribute(
      "href",
      "/tutorials/canvas-basics",
    );
    expect(screen.getByText("Pan, zoom, drag.")).toBeInTheDocument();
    expect(screen.getByText("Tutorial")).toBeInTheDocument();
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
    expect(screen.getByText(/10 sections/)).toBeInTheDocument();
    expect(screen.getByText("canvas")).toBeInTheDocument();
    expect(screen.getByText("interaction")).toBeInTheDocument();
  });

  it("renders without optional metadata and tags", () => {
    render(
      <ContentCard badgeLabel="Tutorial" description="d" href="/x" title="t" />,
    );
    expect(screen.getByText("t").closest("a")).toHaveAttribute("href", "/x");
  });
});

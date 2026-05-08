import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContentCard } from "./progress-card";

describe("ProgressCard ContentCard", () => {
  it("renders title + description + badge label", () => {
    render(
      <ContentCard
        badgeLabel="Tutorial"
        description="Pan, zoom, drag."
        href="/tutorials/canvas-basics"
        title="Canvas basics"
      />,
    );

    expect(screen.getByText("Canvas basics")).toBeInTheDocument();
    expect(screen.getByText("Pan, zoom, drag.")).toBeInTheDocument();
    expect(screen.getByText("Tutorial")).toBeInTheDocument();
  });

  it("renders metadata items", () => {
    render(
      <ContentCard
        badgeLabel="Tutorial"
        description="d"
        href="/x"
        metadata={["30 min", "10 sections"]}
        title="t"
      />,
    );

    expect(screen.getByText(/30 min/)).toBeInTheDocument();
    expect(screen.getByText(/10 sections/)).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(
      <ContentCard
        badgeLabel="Tutorial"
        description="d"
        href="/x"
        tags={["canvas", "interaction"]}
        title="t"
      />,
    );

    expect(screen.getByText("canvas")).toBeInTheDocument();
    expect(screen.getByText("interaction")).toBeInTheDocument();
  });

  it("wraps the card in an anchor pointing at href", () => {
    render(
      <ContentCard
        badgeLabel="Tutorial"
        description="d"
        href="/tutorials/x"
        title="t"
      />,
    );

    expect(screen.getByText("t").closest("a")).toHaveAttribute(
      "href",
      "/tutorials/x",
    );
  });
});

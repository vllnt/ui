import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ObjectCard } from "./object-card";

describe("ObjectCard", () => {
  it("renders object metadata and state", () => {
    render(
      <ObjectCard
        footer="Last output 2m ago"
        kind="Run"
        metrics={[{ label: "Artifacts", value: "7" }]}
        state="running"
        summary="Tracks the live execution state for a workflow."
        title="Nightly content pipeline"
      />,
    );

    expect(screen.getByText("Nightly content pipeline")).toBeInTheDocument();
    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("Artifacts")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});

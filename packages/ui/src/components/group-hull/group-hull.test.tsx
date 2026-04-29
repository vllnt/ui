import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GroupHull } from "./group-hull";

describe("GroupHull", () => {
  it("renders title and description", () => {
    render(
      <GroupHull
        description="A durable object neighborhood."
        title="Publishing lane"
      >
        <div>Child object</div>
      </GroupHull>,
    );

    expect(screen.getByText("Publishing lane")).toBeInTheDocument();
    expect(
      screen.getByText("A durable object neighborhood."),
    ).toBeInTheDocument();
    expect(screen.getByText("Child object")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { GroupHull } from "./group-hull";

it("GroupHull renders title and description", () => {
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

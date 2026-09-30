import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { EdgeLabel } from "./edge-label";

it("EdgeLabel renders children and emphasis data attribute", () => {
  render(<EdgeLabel emphasis="active">artifact stream</EdgeLabel>);
  const label = screen.getByText("artifact stream");
  expect(label).toHaveAttribute("data-emphasis", "active");
});

import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { KeyConcept } from "./key-concept";

it("KeyConcept renders a visible root that applies custom className", () => {
  const { container } = render(
    <KeyConcept className="custom-class">Test Content</KeyConcept>,
  );
  expect(container.firstChild).toBeVisible();
  expect(container.firstChild).toHaveClass("custom-class");
});

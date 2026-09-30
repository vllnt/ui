import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { FloatingActionButton } from "./floating-action-button";

it("FloatingActionButton renders a visible root that applies custom className", () => {
  const { container } = render(
    <FloatingActionButton className="custom-class" />,
  );
  expect(container.firstChild).toBeVisible();
  expect(container.firstChild).toHaveClass("custom-class");
});

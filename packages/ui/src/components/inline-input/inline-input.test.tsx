import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { InlineInput } from "./inline-input";

it("InlineInput renders a visible root that applies custom className", () => {
  const { container } = render(<InlineInput className="custom-class" />);
  expect(container.firstChild).toBeVisible();
  expect(container.firstChild).toHaveClass("custom-class");
});

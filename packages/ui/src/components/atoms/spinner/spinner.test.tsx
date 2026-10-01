import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeVisible();
  });
});

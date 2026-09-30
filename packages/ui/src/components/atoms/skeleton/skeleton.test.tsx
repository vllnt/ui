import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeVisible();
  });
});

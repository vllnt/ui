import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";

describe("Alert", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(<Alert className="custom-class" ref={ref} />);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it.each(["default", "destructive"] as const)(
    "renders %s variant",
    (variant) => {
      const { container } = render(<Alert variant={variant} />);
      expect(container.firstChild).toBeInTheDocument();
    },
  );
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders a visible root that merges className", () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it.each(["default", "destructive", "outline", "secondary"] as const)(
    "renders %s variant",
    (variant) => {
      const { container } = render(<Badge variant={variant}>Test</Badge>);
      expect(container.firstChild).toBeInTheDocument();
    },
  );
});

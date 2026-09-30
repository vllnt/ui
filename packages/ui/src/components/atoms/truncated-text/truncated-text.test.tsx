import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TruncatedText } from "./truncated-text";

describe("TruncatedText", () => {
  it("applies custom className", () => {
    const { container } = render(<TruncatedText className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<TruncatedText />);
    expect(container.firstChild).toBeVisible();
  });
});

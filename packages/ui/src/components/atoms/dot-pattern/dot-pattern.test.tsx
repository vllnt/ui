import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DotPattern } from "./dot-pattern";

describe("DotPattern", () => {
  it("renders the background with a custom class name", () => {
    const { container } = render(<DotPattern className="custom-class" />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("omits the fade mask when disabled", () => {
    const { container } = render(<DotPattern fade={false} />);
    const element = container.firstChild;
    expect(element).toBeInstanceOf(HTMLElement);
    if (element instanceof HTMLElement) {
      expect(element.style.maskImage).toBe("");
    }
  });
});

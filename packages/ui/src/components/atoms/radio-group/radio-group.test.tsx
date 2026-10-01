import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RadioGroup } from "./radio-group";

describe("RadioGroup", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <RadioGroup className="custom-class" ref={ref} />,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

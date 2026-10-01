import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Command } from "./command";

describe("Command", () => {
  it("renders a visible root that merges className and forwards ref", () => {
    const ref = { current: null };
    const { container } = render(
      <Command className="custom-class" ref={ref}>
        Test
      </Command>,
    );
    expect(container.firstChild).toBeVisible();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

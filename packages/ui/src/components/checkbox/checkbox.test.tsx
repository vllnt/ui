import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders a visible checkbox that merges className and forwards ref", () => {
    const ref = { current: null };
    render(<Checkbox className="custom-class" ref={ref} />);
    expect(screen.getByRole("checkbox")).toBeVisible();
    expect(screen.getByRole("checkbox")).toHaveClass("custom-class");
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

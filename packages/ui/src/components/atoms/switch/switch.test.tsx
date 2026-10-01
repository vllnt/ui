import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Switch } from "./switch";

describe("Switch", () => {
  it("applies custom className", () => {
    render(<Switch className="custom-class" />);
    expect(screen.getByRole("switch")).toHaveClass("custom-class");
  });

  it("forwards ref to DOM element", () => {
    const ref = { current: null };
    render(<Switch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("has accessible switch role", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeVisible();
  });
});

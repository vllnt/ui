import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

describe("Switch Radix-compatible state", () => {
  it("mirrors the checked state in data-state on the root and the thumb", () => {
    render(<Switch aria-label="Wifi" />);
    const toggle = screen.getByRole("switch", { name: "Wifi" });
    const thumb = toggle.querySelector("span");
    expect(toggle).toHaveAttribute("data-state", "unchecked");
    expect(thumb).toHaveAttribute("data-state", "unchecked");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "checked");
    expect(thumb).toHaveAttribute("data-state", "checked");
  });

  it("reports the new state through onCheckedChange", () => {
    const handleChange = vi.fn();
    render(<Switch aria-label="Wifi" onCheckedChange={handleChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "Wifi" }));
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
  });
});
